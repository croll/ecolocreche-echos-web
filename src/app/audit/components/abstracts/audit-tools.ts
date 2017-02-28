import { Impact } from '../../../question/components/abstracts/impacts'

export class AuditTools {

  private static instance;
  private static impact
  private static impactObj = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0};

  public static getInstance() {
    if (!AuditTools.instance) {
      AuditTools.instance = new AuditTools();
      AuditTools.impact = new Impact(null);
    }
    return AuditTools.instance;
  }

  cacheDatas(nodes, id_theme = null, questionsList = {}, chartDatas = {themes: {}, families: {}}) {
    if (nodes.childs && nodes.childs.length) {
      nodes.childs.forEach(node => {
        // Store impact informations for graph generation
        if (!node.id_node_parent) {
          id_theme = node.id_node;
          if (!chartDatas.themes[id_theme]) {
            chartDatas.themes[id_theme] = {id: node.id, id_node: node.id_node, hasDatas: false, title: node.title, family: node.family, impact: Object.assign({}, AuditTools.impactObj), totalAnswersWithImpact: 0};
          }
        }
        AuditTools.instance.cacheDatas(node, id_theme, questionsList, chartDatas);
        // If it'as a question
        if (node.type.substring(0, 2) == 'q_') {
          let question = {id: node.id, id_node: node.id_node, id_theme: id_theme, title: node.title, description: node.description, type: node.type, ignored: false, choices: null, value: undefined};
          if (node.answer) {
            if (!node.answer.ignored) {
              let value = JSON.parse(node.answer.value);
              // checkbox of percentage
              if (node.type == 'q_checkbox' || node.type == 'q_percents') {
                question.value = [];
                for(let id_choice in value) {
                  node.choices.forEach(c => {
                    if (parseInt(id_choice) == c.id_choice) {
                      if (node.type != 'q_percents' || value[id_choice] > 0) {
                        let impact = AuditTools.impact.getImpact(c.impact);
                        if (impact.id != 0) {
                          if (!chartDatas.themes[id_theme].hasDatas) {
                            chartDatas.themes[id_theme].hasDatas = true;
                          }
                          chartDatas.themes[id_theme].impact[impact.id]++;
                          chartDatas.themes[id_theme].totalAnswersWithImpact++;
                        }
                        let choice = {title: c.title, impact: impact, comment: c.comment, value: value[id_choice], color: null};
                        question.value.push(choice);
                      }
                    }
                  });
                }
                // radio
              } else if (node.type == 'q_radio'){
                question.value = [];
                node.choices.forEach(c => {
                  if (value == c.id_choice) {
                    let impact = AuditTools.impact.getImpact(c.impact);
                    if (impact.id != 0) {
                      if (chartDatas.themes[id_theme] && !chartDatas.themes[id_theme].hasDatas) {
                        chartDatas.themes[id_theme].hasDatas = true;
                      }
                      chartDatas.themes[id_theme].impact[impact.id]++;
                      chartDatas.themes[id_theme].totalAnswersWithImpact++;
                    }
                    let choice = {title: c.title, impact: impact, comment: c.comment, color: null}
                    question.value.push(choice);
                  }
                });
                // All other question type, for now string and number
              } else {
                question.value = value;
              }
            } else {
              question.ignored = true;
            }
          }
          questionsList[question.id_node] = question;
        }
      });
    }
    return {questionList: questionsList, chartDatas: chartDatas};
  }

  toChartDatas(chartType, datas) {
    let params = {
      labels: [],
      chartType: chartType,
      datasets: [],
      colors: [{}],
      options: {}
    }
    if (chartType == 'pie') {
      let dataset = {
        backgroundColor: [],
        data: []
      }
      for (let id_impact in datas.impact) {
        let impact = AuditTools.impact.getImpact(id_impact)
        params.labels.push(impact.label);
        dataset.backgroundColor.push(impact.color);
        dataset.data.push(datas.impact[id_impact]);
      }
      params.options = {
        tooltips: {
          callbacks: {
            label: (tooltipItem, data) => {
              let total = 0;
              for (let k in data.datasets[0].data) {
                total += data.datasets[0].data[k];
              }
              return ' '+(data.datasets[0].data[tooltipItem.index] * 100 / total).toFixed(1) + '% ('+data.datasets[0].data[tooltipItem.index]+')';
            }
          }
        }
      }
      params.datasets.push(dataset);
    } else if (chartType == 'bar') {
      params.labels.push(datas.title);
      params.options = {scales:{yAxes:[{stacked:true}]}, stacked: true};
      for (let id_impact in datas.impact) {
        let impact = AuditTools.impact.getImpact(id_impact)
        let dataset = {
          label: impact.label,
          backgroundColor: impact.color,
          data: [datas.impact[id_impact]]
        }
        params.datasets.push(dataset);
      }
    } else if (chartType == 'radar') {
    }
    return params;
  }

  generateChartDatas(chartType, chartDatas) {
    chartDatas.families = {global: {hasDatas: true, impact: Object.assign({}, AuditTools.impactObj)}, other: {hasDatas: false, impact: Object.assign({}, AuditTools.impactObj)}, environnementales: {hasDatas: false, impact: Object.assign({}, AuditTools.impactObj)}, sociales: {hasDatas: false, impact: Object.assign({}, AuditTools.impactObj)}};
    for (let id_theme in chartDatas.themes) {
      for(let k in chartDatas.themes[id_theme].impact) {
        let fam = (!chartDatas.themes[id_theme].family) ? 'other' : chartDatas.themes[id_theme].family;
        console.log(fam);
        if (!chartDatas.families[fam].hasDatas && chartDatas.themes[id_theme].impact[k]) {
          chartDatas.families[fam].hasDatas = true
        }
        chartDatas.families[fam].impact[k] = chartDatas.families[fam].impact[k] + chartDatas.themes[id_theme].impact[k];
        chartDatas.families['global'].impact[k] = chartDatas.families['global'].impact[k] + chartDatas.themes[id_theme].impact[k];
      }
      Object.assign(chartDatas.themes[id_theme], AuditTools.instance.toChartDatas(chartType, chartDatas.themes[id_theme]));
    }

    // Generate family impact datas
    for (let fam in chartDatas.families) {
      Object.assign(chartDatas.families[fam], AuditTools.instance.toChartDatas(chartType, chartDatas.families[fam]));
    }
    return chartDatas;
  }

}
