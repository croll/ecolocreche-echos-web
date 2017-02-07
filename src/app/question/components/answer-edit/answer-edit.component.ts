import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Question } from '../../question';
import { Choice } from '../../choice';
import { QTypes } from '../abstracts/qtypes';
import { RestService} from '../../../rest.service';

@Component({
  selector: 'answer-edit',
  templateUrl: './answer-edit.component.html',
  styleUrls: ['./answer-edit.component.scss']
})
export class AnswerEditComponent implements OnInit {

  @Input()
  id_node: number;
  @Input()
  id_audit: number;

  qtypes = QTypes.getInstance();

  isAnswered = false;

  echosForm: FormGroup;
  current: Question = new Question();
  choices : Choice[] = [];

  idCtrl: FormControl;
  ignoredCtrl: FormControl;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private restService: RestService, private location: Location) {

    this.idCtrl = fb.control(this.id_node);
    this.ignoredCtrl = fb.control(this.current.answer.ignored);

    this.echosForm = fb.group({
      id_node: this.idCtrl,
      ignored: this.ignoredCtrl,
    });

  }

  ngOnInit() {
      this.get();
  }

  get() {
      this.restService.get(this.id_node, 'hist/nodes', {
          id_audit: this.id_audit,
      }).subscribe(item => {
        this.echosForm.patchValue(item);
        this.current = Object.assign(this.current, item);
        this.choices = [];
        if ('choices' in item) {
          item.choices.forEach((jschoice) => {
            let choice = new Choice();
            Object.assign(choice, jschoice);
            this.choices.push(choice);
          })
        }
      }, (err) => {
        console.error(err);
      });
  }

  save() {
      console.log("save answer to do !");
      this.isAnswered = true;
  }

  modify() {
      this.isAnswered = false;
  }

}