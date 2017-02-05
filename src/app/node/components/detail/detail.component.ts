import { Component, OnInit, HostBinding } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RestService } from '../../../rest.service';
import { Location } from '@angular/common';
import { Node } from '../../node';

@Component({
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {

  private id_node: number;
  item: Node;
  id_theme: number;
  id_category: number;
  id_node_parent: number;
  type: string;
  childList: Node[] = [];
  filteredChildList: Node[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private restService: RestService, private location: Location) {
    this.id_theme = parseInt(this.route.snapshot.params['id_theme']);
    this.id_category = parseInt(this.route.snapshot.params['id_category']);
    if (this.id_category) {
      this.id_node = this.id_category;
      this.id_node_parent = this.id_theme;
      this.type = 'category';
    } else {
      this.id_node = this.id_theme;
      this.type = 'theme';
    }
    this.item = new Node();
  }

  ngOnInit() {
    this.restService.get(this.id_node, `hist/nodes`, {id_node_parent: this.id_node_parent}).subscribe(item => {
      this.item = item;
    });
    this.getChildList();
  }

  getChildList() {
    this.restService.getList(`hist/nodes`, {id_node_parent: this.id_node}).subscribe(
     nodes => {
       this.childList = nodes;
       this.filteredChildList = this.childList;
     },
     error => {
       console.log(error);
     });
  }

  filterList(filter) {
    this.filteredChildList = filter ? this.childList.filter(item => item.title.toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) != -1) : this.childList;
  }

  goBack(): boolean {
    this.location.back();
    return false;
  }

}