import { Component, OnInit } from '@angular/core';
import {BackendService} from "../../backend.service";
import {ExportPhonesResult, PhoneGeoHashMerge} from "../../headerindex";
import * as XLSX from "xlsx";
import {Router} from "@angular/router";

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {

  displayPhonesGeoHashDataTime: ExportPhonesResult[] = [];

  mergePhonesGeoHashNameDataTime: PhoneGeoHashMerge[] = [];

  downLoadFileName: string = "";

  preGeoHashName: PhoneGeoHashMerge = {} as PhoneGeoHashMerge

  isExporting = false;

  constructor(private router:Router,
              private service: BackendService) { }

  ngOnInit(): void {

    this.service.getExportGeoHashDataTime().subscribe(data =>{
      this.displayPhonesGeoHashDataTime = data.filter(t => t.geoHash.length > 1);
    });

    if (this.displayPhonesGeoHashDataTime.length <= 1){

      this.router.navigateByUrl("/");
    }
    else {

      this.doGeoHashNameMerge();

      console.log(this.mergePhonesGeoHashNameDataTime)

    }
  }

  doGeoHashNameMerge():void {

    let currentGeoHashNameArray = {} as PhoneGeoHashMerge

    this.displayPhonesGeoHashDataTime.forEach(row =>{

      if(typeof (currentGeoHashNameArray.baseArray) === "undefined"){
        currentGeoHashNameArray = {
          "phone":row.phone,
          "beginTime":row.beginTime,
          "endTime":row.endTime,
          "interval":0,
          "baseArray":[row.geoHashName],
          "baseNameMerge":""
        }
      }
      else{
        let findBaseName = currentGeoHashNameArray.baseArray.find(t => t=== row.geoHashName)

        //什么时候把geohashName加入到数组中
        if (row.interval < 1 && typeof findBaseName === "undefined") currentGeoHashNameArray.baseArray.push(row.geoHashName)

        if (typeof findBaseName === "undefined" && row.interval >= 2){
          currentGeoHashNameArray.endTime = this.preGeoHashName.endTime
          currentGeoHashNameArray.baseArray.push(row.geoHashName)

          currentGeoHashNameArray = this.doDataUpdateAndInsertIntoArrays(currentGeoHashNameArray)

          this.mergePhonesGeoHashNameDataTime.push({...currentGeoHashNameArray})
          currentGeoHashNameArray = {
            "phone":row.phone,
            "beginTime":row.beginTime,
            "endTime":row.endTime,
            "interval":0,
            "baseArray":[row.geoHashName],
            "baseNameMerge":""
          }
        }else {
          currentGeoHashNameArray.endTime = row.endTime
        }
      }
      this.preGeoHashName.phone = row.phone
      this.preGeoHashName.endTime = row.endTime;

    })


    currentGeoHashNameArray = this.doDataUpdateAndInsertIntoArrays(currentGeoHashNameArray)
    this.mergePhonesGeoHashNameDataTime.push({...currentGeoHashNameArray})


  }

  doDataUpdateAndInsertIntoArrays(t: PhoneGeoHashMerge): PhoneGeoHashMerge {
    t.interval = Math.round(Math.abs( (new Date(t.endTime).getTime()
        - new Date(t.beginTime).getTime() ))
      / (1000 * 60))
    t.baseNameMerge = t.baseArray.join('|')

    return t
  }

  addNewExcelSheets(wb: XLSX.WorkBook, header: any, contents: any, options: any, sheetName:string): void {

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);

    ws['!cols'] = options;

    XLSX.utils.sheet_add_aoa(ws,header);
    XLSX.utils.sheet_add_json(ws, contents, {origin: 'A2', skipHeader: true})

    XLSX.utils.book_append_sheet(wb, ws, sheetName);

  }

  exportExcel(): void {

    this.isExporting = true;

    setTimeout(() =>{

      //this.downLoadFileName = Date.now().toString();
      this.downLoadFileName = [... new Set(this.displayPhonesGeoHashDataTime.map(t => t.phone))].join("_")



      const wb: XLSX.WorkBook = XLSX.utils.book_new();

      const header = [["用户号码","GEOHASH","进入时间","离开时间","停留时长", "基站名称"]];
      const wscols = [
        {wch:30},
        {wch:30},
        {wch:30},
        {wch:30},
        {wch:30},
        {wch:30}
      ];
      this.addNewExcelSheets(wb, header, this.displayPhonesGeoHashDataTime, wscols, '原始结果')

      const header2 = [["用户号码", "进入时间", "离开时间","停留时长","基站集合"]]

      this.addNewExcelSheets(wb, header2,
        this.mergePhonesGeoHashNameDataTime.map(t => (
          {
            phone:t.phone,
            beginTime: t.beginTime, endTime: t.endTime,
            interval: t.interval,
            baseName: t.baseNameMerge
          })), wscols, '智能合并')

      XLSX.writeFile(wb, `${this.downLoadFileName}_xxx.xlsx`)

      this.isExporting = false;

    }, 500)

  }

}
