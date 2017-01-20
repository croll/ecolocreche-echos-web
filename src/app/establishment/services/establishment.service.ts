import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import { Establishment } from '../establishment';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class EstablishmentService {

  constructor(private http: Http) { }

  public getList(): Observable<Establishment[]> {
    return this.http.get('rest/establishments')
                    .map(this.extractData)
                    .catch(this.handleError);
  }

  public get(id: number): Observable<Establishment> {
    return this.http.get(`rest/establishments/${id}`)
                    .map(this.extractData)
                    .catch(this.handleError);
  }

  save(obj): Observable<Establishment> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options       = new RequestOptions({ headers: headers });
    console.log('SAVE', obj);

    if (obj.id) {
      return this.http.patch('rest/establishments', JSON.stringify(obj), options)
              .map(this.extractData)
              .catch(this.handleError);
    } else {
      return this.http.post('rest/establishments', JSON.stringify(obj), options)
              .map(this.extractData)
              .catch(this.handleError);
    }


  }

  private extractData(res: Response) {
    let body = res.json();
    return body || { };
  }

  private handleError (error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

}
