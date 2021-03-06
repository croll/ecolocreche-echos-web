import { Component, OnInit, Input, forwardRef, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Impact } from '../../abstracts/impacts';
import { Question } from '../../../question';
import { Choice } from '../../../choice';
import { Answer } from '../../../answer';
import { ChartsModule, BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'q-percents-answer-edit',
  templateUrl: './answer-edit.component.html',
  styleUrls: ['./answer-edit.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AnswerEditComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => AnswerEditComponent), multi: true }
  ]
})
export class AnswerEditComponent implements OnInit {

  @Input() choices: Choice[];
  @Input() answer: Answer;
  @Input('value') _value = "";
  @Input() readonly: boolean;

  propagateChange:any = () => {};
  validateFn:any = () => {};

  impact: Impact;
  vals = [0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100];
  nothundred = false;
  overhundred = false;
  total = 0;

  donut:any = {
    colors: [{
      backgroundColor: ["#ff9800", "#C0C0C0"]
    }],
    datasets: [
      {
        data: [0,0]
      }],
    options: { tooltips: { enabled: false } }
  }

  constructor(private fb: FormBuilder, public sanitizer: DomSanitizer) {
    this.impact = Impact.getInstance(sanitizer);
  }

  setDonutChartValue() {
    this.total = 0;
    for (let choice of this.choices) {
      this.total+=Number.isInteger(Number.parseInt(choice['value'])) ? Number.parseInt(choice['value']) : 0;
    }
    let max = (this.total < 100) ? 100 - this.total : 0;
    // let color = (this.total < 100) ? "#ff9800" : "#FF6384";
    Object.assign(this.donut, {
      // colors: [{
      //   backgroundColor: ["#ff9800", "#C0C0C0"]
      // }],
      datasets: [{data: [this.total, max]}]
    });
    this.nothundred = (this.total < 100) ? true : false;
    this.overhundred = (this.total > 100) ? true : false;

    this.propagateChange(this.value);
  }

  findChoiceById(id_choice) : Choice {
      for (let choice of this.choices) {
          if (choice.id_choice == id_choice)
            return choice;
      }
      return null;
  }

  ngOnInit() {
      this.value=this._value;
      // this.updatevalue();
      this.setDonutChartValue();
  }

  updatevalue() {
      let latest_choice=this.choices.slice(-1).pop();
      let total = 0;
      for (let choice of this.choices) {
          if (choice != latest_choice)
            total+=Number.isInteger(Number.parseInt(choice['value'])) ? Number.parseInt(choice['value']) : 0;
      }

      let latestval=100 - total;
      if (latestval < 0)
            latestval = 0;
      if (latestval > 100)
         latestval=100;

      latest_choice['value']=latestval;

      // console.log("latestval: ", latestval);

      this.propagateChange(this.value);
  }

  onInput(val, item) {
    item.liveValue = val;
  }

  get value() {
      let res={};
      for (let choice of this.choices) {
          res[choice.id_choice] = Number.isInteger(Number.parseInt(choice['value'])) ? Number.parseInt(choice['value']) : 0;
      }
      return JSON.stringify(res);
  }

  set value(val) {
      if (val) {
          let ar=JSON.parse(val);
          for (let id_choice in ar) {
              let choice = this.findChoiceById(id_choice);
              let value = Number.isInteger(parseInt(ar[id_choice])) ? parseInt(ar[id_choice]) : 0;
              if (choice) choice['value'] = value;
          }
      }
      //this.propagateChange(val);
      this.propagateChange(this.value);
  }

  ngOnChanges(inputs) {
      /*
    if (inputs.counterRangeMax || inputs.counterRangeMin) {
      this.validateFn = createCounterRangeValidator(this.counterRangeMax, this.counterRangeMin);
      this.propagateChange(this.counterValue);
    }
    */
  }

  writeValue(value) {
    if (value) {
      this.value = value;
    }
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() {
  }

  validate(c: FormControl) {
    var value = this.value;
      let err = {
          badTotalError: {
              given: value,
          }
      };

      if (value) {
          let total = 0;
          let ar=JSON.parse(value);
          for (let id_choice in ar) {
              let value = Number.isInteger(parseInt(ar[id_choice])) ? parseInt(ar[id_choice]) : 0;
              total+=value;
          }
          if (total != 100) {
              this.nothundred = true;
              return err;
          }
      } else {
          this.nothundred = true;
          return err;
      }
      this.nothundred = false;
  }

}
