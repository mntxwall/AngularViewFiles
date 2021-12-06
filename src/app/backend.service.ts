import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable, of} from "rxjs";
import {dataToBackend, PhoneGeoHashDateTimeCounts, ViewData} from "./headerindex";
import {tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  tableData: string = "";
  headers : string[] = [];

  resultPhonesGeoHashDataTime: PhoneGeoHashDateTimeCounts[] = [];

  tripPhonesGeoHashDataTime: PhoneGeoHashDateTimeCounts[] = [];

  constructor(private http: HttpClient) { }

  setTableData(data: string) {
    this.tableData = data;
  }

  getTableData():Observable<string> {
    return of(this.tableData);
  }

  setResultPhoneGeoHashDataTime(data: PhoneGeoHashDateTimeCounts[]) {
    this.resultPhonesGeoHashDataTime = data;
  }

  getResultPhoneGeoHashDataTime(): Observable<PhoneGeoHashDateTimeCounts[]>{
    return of(this.resultPhonesGeoHashDataTime)
  }

  setTripPhoneGeoHashDataTime(data: PhoneGeoHashDateTimeCounts[]) {
    this.tripPhonesGeoHashDataTime = data;
  }
  getTripPhoneGeoHashDataTime(): Observable<PhoneGeoHashDateTimeCounts[]>{
    return of(this.tripPhonesGeoHashDataTime)
  }


  sendImportDataToServer(contents: dataToBackend): Observable<string[]>  {
    console.log("Hello")
    return this.http.post<string[]>("http://192.168.92.128:9000/api/match", contents).pipe(
      tap(_ => console.log('postData')))
  }


}
