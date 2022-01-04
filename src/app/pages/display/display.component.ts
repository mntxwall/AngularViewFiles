import {Component, OnInit} from '@angular/core';
import {BackendService} from "../../backend.service";
import {ExportPhonesResult, PhoneGeoHashDateTimeCounts, StayTime} from "../../headerindex";
import {Router} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";

import * as XLSX from 'xlsx';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit {

  displayPhonesGeoHashDataTime: PhoneGeoHashDateTimeCounts[] = [];

  tripGeoHashDataTime : PhoneGeoHashDateTimeCounts[] = [];

  expandSet = new Set<string>();

  downLoadFileName: string = "";

  exportCsvString: string = "";
  isExporting = false;

  exportDataList: ExportPhonesResult[] = [];

  //expandGeoHashDateTimes: StayTime[] | undefined = [];

  constructor(private router:Router,
              private service: BackendService,
              private modal: NzModalService) { }

  ngOnInit(): void {
   this.service.getResultPhoneGeoHashDataTime().subscribe(data => {
     this.displayPhonesGeoHashDataTime = data;

     this.displayPhonesGeoHashDataTime.sort((a, b) => (a.sumDateTimes > b.sumDateTimes) ? -1 : 1);

     //时间段进行排序
     this.displayPhonesGeoHashDataTime.forEach(t =>{
       t.dateTimes.sort((a, b) => (a.interval > b.interval) ? -1 : 1)
     });

     this.service.getTripPhoneGeoHashDataTime().subscribe(data => {

       this.tripGeoHashDataTime = data;
     });

     /*
     this.displayPhonesGeoHashDataTime =  this.displayPhonesGeoHashDataTime.filter(f => {
       return f.sumDateTimes > 0
     });*/

   });


   if (this.displayPhonesGeoHashDataTime.length <= 1){

     // @ts-ignore
     this.router.navigateByUrl("/");
   }

    //console.log(this.service.getResultPhoneGeoHashDataTime())
  }

  onExpandChange(geohash: string, checked: boolean): void {
    if (checked) {
      this.expandSet.add(geohash);
      //this.expandGeoHashDateTimes = this.displayPhonesGeoHashDataTime.find(e => e.geohash === geohash)?.dateTimes;

    } else {
      this.expandSet.delete(geohash);
      //this.expandGeoHashDateTimes = [];
    }
  }


  exportCsv = ()=>{

    console.log("OK");

    //let exportCsvString = "号码,GEOHASH,停留总时长,开始时间,结束时间,停留区间时长\r\n";

    this.exportCsvString = "号码,GEOHASH,停留总时长,进入时间,离开时间,停留区间时长,GEOHASH中最多次数基站名\r\n";


    //this.exportCsvString = "类型,号码,进入时间,离开时间,停留区间时长,GEOHASH,GEOHASH中最多次数基站名\r\n";

       this.tripGeoHashDataTime.forEach(row => {

         row.dateTimes.forEach(dates =>{
           this.exportCsvString += "出行"+ "," + row.phone + "," +
             dates.end.toString() + "," + dates.start + "," + dates.interval + "," + row.geoHashName +"\r\n";
         });
       });

    this.displayPhonesGeoHashDataTime.forEach(row => {
/*
      row.dateTimes.forEach(dates =>{
        this.exportCsvString += row.phone + "," + row.geohash + "," + row.sumDateTimes + "," +
          dates.end.toString() + "," + dates.start + "," + dates.interval + "," + row.geoHashName +"\r\n";
      });

 */
      row.dateTimes.forEach(dates =>{
        this.exportCsvString += "普通"+ "," + row.phone + "," +
          dates.end.toString() + "," + dates.start + "," + dates.interval + "," + row.geoHashName +"\r\n";
      });


    });


    const blob = new Blob([ "\uFEFF" + this.exportCsvString], { type: 'text/csv;charset=GBK;' });

    const a = document.createElement('a');

    const url = window.URL.createObjectURL(blob);


    a.href = url;
    a.download = + this.downLoadFileName + '.csv';
    a.click();

    a.onclick = () => {
      window.URL.revokeObjectURL(url);
    };

    this.isExporting = false;
 //   window.URL.revokeObjectURL(url);
    a.remove();
  };

  exportExcel(): void {


    this.downLoadFileName = Date.now().toString();


    this.displayPhonesGeoHashDataTime.forEach(rows =>{
      rows.dateTimes.map(dates =>{

        let resultRow: ExportPhonesResult = {} as ExportPhonesResult;

        resultRow.phone = rows.phone;
        resultRow.geoHash = rows.geoHashName;
        resultRow.beginTime = dates.start;
        resultRow.endTime = dates.end;
        resultRow.interval = dates.interval;

        this.exportDataList.push(resultRow)
      });
    })

    const header = [["用户号码","基站名称","进入时间","离开时间","停留时长"]];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);

    XLSX.utils.sheet_add_aoa(ws,header);
    XLSX.utils.sheet_add_json(ws, this.exportDataList, {origin: 'A2', skipHeader: true})

    XLSX.utils.book_append_sheet(wb, ws, 'result');
    XLSX.writeFile(wb, `${this.downLoadFileName}.xlsx`)

    //this.displayPhonesGeoHashDataTime.forEach()

  }

  exportData(): void {

    this.isExporting = true;
    this.downLoadFileName = Date.now().toString();

    this.exportCsv();

    // @ts-ignore
    this.modal.confirm({
      nzTitle: '<i>下载进行中</i>',
      nzContent: `<b>本次下载文件的名字为：${this.downLoadFileName}.csv</b>`,

    });


    /*
    console.log(this.displayPhonesGeoHashDataTime);

    let str="你,我,他\r\nD,E,F";
    let exportCsvString = "号码,GEOHASH,停留总时长,开始时间,结束时间,停留区间时长\r\n";

    this.displayPhonesGeoHashDataTime.forEach(row => {
      row.dateTimes.forEach(dates =>{
        exportCsvString += row.phone + "," + row.geohash + "," + row.sumDateTimes + "," +
          dates.end.toString() + "," + dates.start + "," + dates.interval + "\r\n";
      });
    });

    const blob = new Blob([ "\uFEFF" + exportCsvString], { type: 'text/csv;charset=GBK;' });

    const a = document.createElement('a');

    const url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = Date.now().toString() + '.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();*/

  }

}
