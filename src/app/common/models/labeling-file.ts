import { Injectable } from '@angular/core';
import { RestService } from '../../rest.service';

export class LabelingFile {

  public id: number
  public id_establishment: number
  public id_labelingfile_src: number
  public id_audit_1: number
  public id_audit_2: number
  public id_audit_recap_actions: number

}

export namespace LabelingFile {
  export class Json {
    public logo: string
    public custom_headers: CustomHeader[] = []
    public themes_commitments: ThemeCommitment[] = []
    public themes_comments: ThemeComment[] = []
    public hide_comments: boolean = false
    public hide_social_details: boolean = false
    public hide_balance_sheet_social_radar: boolean = false
    public hide_balance_sheet_social_bar: boolean = false
    public hide_balance_sheet_social_pie: boolean = false
    public hide_environment_details: boolean = false
    public hide_balance_sheet_environmental_radar: boolean = false
    public hide_balance_sheet_environmental_bar: boolean = false
    public hide_balance_sheet_environmental_pie: boolean = false
  }

  export class CustomHeader {
    label: string
    value: string
    constructor(l: string, v: string) {
      this.label = l;
      this.value = v;
    }
  }

  export class ThemeCommitment {
    id_theme: number
    value: string
    constructor(idt: number , v: string) {
      this.id_theme = idt;
      this.value = v;
    }
  }

  export class ThemeComment {
    id_theme: number
    past_action: string
    future_action: string
    constructor(idt: number , pa: string = null, fa: string = null) {
      this.id_theme = idt;
      this.past_action = pa;
      this.future_action = fa;
    }
  }

}
