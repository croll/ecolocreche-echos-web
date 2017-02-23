import { Component, OnInit, HostBinding, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { InquiryForm, InquiryFormExt } from '../../../inquiry-form/inquiry-form';
import { Node } from '../../../node/node';
import { RestService } from '../../../rest.service';
import { AuditTools } from '../../components/abstracts/audit-tools';
import { ChartsModule, BaseChartDirective } from 'ng2-charts';
import * as moment from 'moment';

@Component({
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ReportComponent implements OnInit {

  private id_inquiryform: number;
  node: any;
  infos: any;
  questionList: any;
  themeImpact: any;
  cache: any;
  chartType: string = 'pie';

  auditTools = AuditTools.getInstance();

  @ViewChild( BaseChartDirective ) private _chart;

  constructor(private router: Router, private route: ActivatedRoute, private restService: RestService) {
    this.infos = this.route.snapshot.data['infos'];
    this.cache  = this.auditTools.cacheDatas(this.infos.nodes);
    this.questionList = this.cache.questionList;
    this.themeImpact = this.auditTools.generateChartDatas(this.chartType, this.cache.themeImpact);
  }

  ngOnInit() {
    this.node = this.infos.nodes;
  }

  setChartType(chartType, id_theme) {
    this.chartType = chartType.value;
    Object.assign(this.themeImpact[id_theme], this.auditTools.toChartDatas(this.chartType, this.cache.themeImpact[id_theme]));
    setTimeout(() => {
      this._chart.ngOnChanges({});
    }, 150);
  }

  toggleChartType(chartType, id_theme) {
    chartType = (chartType == 'bar') ? 'pie' : 'bar';
    Object.assign(this.themeImpact[id_theme], this.auditTools.toChartDatas(chartType, this.cache.themeImpact[id_theme]));
    setTimeout(() => {
      this.chart.ngOnChanges({});
      // this._chart.refresh();
    }, 250);
  }

}
