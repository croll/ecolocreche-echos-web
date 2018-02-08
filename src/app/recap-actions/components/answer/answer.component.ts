import { Component, OnInit, HostBinding, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { InquiryForm, InquiryFormExt } from '../../../common/models/inquiry-form';
import { Node } from '../../../common/models/node';
import { RestService } from '../../../rest.service';
import { Http, Response } from '@angular/http';
import { MatSnackBar } from '@angular/material';
import { AuthService } from '../../../auth.service';
import { Answer } from '../../../question/answer';
import { QuillConfigInterface } from 'ngx-quill-wrapper';
import { PuppeteerPdfService } from '../../../puppeteerpdf.service';
import { DomSanitizer } from '@angular/platform-browser';



@Component({
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.scss'],
})
export class AnswerComponent {

  infos: any;
  themes: any;


  public config: QuillConfigInterface = {
   theme: 'bubble',
   modules: {
    toolbar: true
  },
  placeholder: 'Votre commentaire...'
 };

  constructor(private router: Router, private route: ActivatedRoute, private restService: RestService, public authService: AuthService, private location: Location, private pdfService: PuppeteerPdfService, private http: Http, private snackBar: MatSnackBar, private sanitizer: DomSanitizer) {
  }

  ngOnInit() {


    this.route.queryParams.subscribe(params => {
      if (params.new_copy) {
        this.snackBar.open("Vous travaillez maintenant sur un nouveau dossier récap action (copié du précédent)", "", {
          duration: 6000,
        });

      }
    });

    this.route.data.subscribe(datas => {
      this.infos = datas['infos']['audit1'];

      // work on a copy
      this.themes = JSON.parse(JSON.stringify(this.infos.nodes.childs));

      // Init answers
      this.themes.forEach(theme => {
        theme.childs.forEach(question => {
          if (!(question.answer)) {
            // generate answer
            question.answer = Object.assign(new Answer(), {id_audit: this.infos.audit.id, audit_key: this.infos.audit.key, id_node: question.id_node, ignored: false, value: "", comment: ""});
          } else {
            // clean answer
            if (question.answer.value == '{}') {
              question.answer.value = '';
            }
          }
          // cache responses to check if response if different when saving
          question.answer.originalValue = question.answer.value;
        });
      });
    });

  }


  getAuditSrcAnswer(id_theme: number, id_question: number, position: number) {
    if (this.infos.audit.audit_src
      && this.infos.audit.audit_src.nodes
      && this.infos.audit.audit_src.nodes.childs) {
      // search the theme
      for (let theme of this.infos.audit.audit_src.nodes.childs) {
        if (theme.id_node == id_theme) { // we found the theme
          // search the question
          if (theme.childs) {
            for (let question of theme.childs) {
              if (question.answer && question.answer.value && question.position == position) {
                return this.sanitizer.bypassSecurityTrustHtml(question.answer.value);
              }
            }
          }
        }
      }
    }
  }

  save() {

    this.themes.forEach(theme => {
      theme.childs.forEach(question => {
        // Check if response is different to original value
        if (question.answer.value != question.answer.originalValue) {
          delete question.answer.originalValue;
          this.restService.save(question.answer, 'answers/'+question.answer.id_audit+'/'+question.answer.id_node, {}, "HACK TO ALWAYS DO A CREATE, NOT UPDATE", "Sauvegade de la réponse : ", "Ok").subscribe(res => {
            console.log(res);
          });
        }
      });
    });

    return false;
  }

  delete() {
    console.log("delete ?");
    if (confirm("Souhaitez vous vraiment supprimer ce récap action ?")) {
      this.restService.delete(this.infos.audit.id, 'audits').subscribe((response) => {
        this.router.navigate(['/etablissement', this.infos.audit.id_establishment]);
      }, (err) => {
        console.error(err);
      });
    }
    return false;
  }

  pdf() {
    this.pdfService.print("recapaction", this.infos.audit.id);
  }

  sendLink() {
    this.http.post('/rest/auditmail', {
      id_audit: this.infos.audit.id,
    }).subscribe(() => {
      this.snackBar.open("Mail du récap action : ", "ENVOYÉ", {
            duration: 3000,
          });
    })
    return false;
  }

  duplicate() {
    let new_recap=Object.assign({}, this.infos.audit);
    delete new_recap.id;
    delete new_recap.createdAt;
    delete new_recap.updatedAt;
    new_recap=Object.assign(new_recap, {
      id_audit_src: this.infos.audit.id,
      date_start: new Date(),
      date_end: null,
      active: true,
      key: '',
    });

    this.restService.save(new_recap, 'audits').subscribe((audit) => {
      this.router.navigate(['/recap_actions', audit.id], {
        queryParams: {
          new_copy: audit.id_audit_src,
        }
      });
    }, (err) => {
      console.error(err);
    });
  }

  goBack(): boolean {
    this.location.back();
    return false;
  }

}
