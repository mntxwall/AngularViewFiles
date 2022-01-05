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

  isExporting = false;

  constructor(private router:Router,
              private service: BackendService) { }

  ngOnInit(): void {

    this.service.getExportGeoHashDataTime().subscribe(data =>{
      this.displayPhonesGeoHashDataTime = data.filter(t => t.geoHash.length > 1);
    });

    this.doGeoHashNameMerge();

    console.log(this.mergePhonesGeoHashNameDataTime)

    if (this.displayPhonesGeoHashDataTime.length <= 1){

      this.router.navigateByUrl("/");
    }
  }

  doGeoHashNameMerge():void {

    let currentGeoHashNameArray = {} as PhoneGeoHashMerge

    this.displayPhonesGeoHashDataTime.forEach(row =>{

      //console.log("row")
      //console.log(row)

      if(typeof (currentGeoHashNameArray.baseArray) === "undefined"){
        currentGeoHashNameArray.phone = row.phone
        currentGeoHashNameArray.beginTime = row.beginTime
        currentGeoHashNameArray.endTime = row.endTime

        currentGeoHashNameArray.baseArray = []
        currentGeoHashNameArray.baseArray.push(row.geoHashName)
        //this.mergePhonesGeoHashNameDataTime.push(currentGeoHashNameArray)
      }
      else if (currentGeoHashNameArray.baseArray.find(t => {
        return t === row.geoHashName
        //t.localeCompare(row.geoHashName)
      })){
        currentGeoHashNameArray.endTime = row.endTime
      }
      else if(row.interval < 2){
        currentGeoHashNameArray.endTime = row.endTime
        currentGeoHashNameArray.baseArray.push(row.geoHashName)
      }
      else {
        //currentGeoHashNameArray.baseArray.push(row.geoHashName)

        //currentGeoHashNameArray.endTime = row.endTime
        //const tmp = {...currentGeoHashNameArray};
        //console.log("push")
        this.mergePhonesGeoHashNameDataTime.push({...currentGeoHashNameArray});

        /*this.mergePhonesGeoHashNameDataTime.push({
          "phone":row.phone,
          "beginTime":row.beginTime,
          "endTime":"",
          "interval":0,
          "baseArray":[],
          "baseNameMerge":""

        })*/
        //currentGeoHashNameArray = {} as PhoneGeoHashMerge;


      }




    })


  }

  exportExcel(): void {

    this.isExporting = true;

    setTimeout(() =>{

      this.downLoadFileName = Date.now().toString();

      const header = [["用户号码","GEOHASH","进入时间","离开时间","停留时长", "基站名称"]];

      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);

      var wscols = [
        {wch:30},
        {wch:30},
        {wch:30},
        {wch:30},
        {wch:30},
        {wch:30}
      ];
      ws['!cols'] = wscols;

      XLSX.utils.sheet_add_aoa(ws,header);
      XLSX.utils.sheet_add_json(ws, this.displayPhonesGeoHashDataTime, {origin: 'A2', skipHeader: true})

      XLSX.utils.book_append_sheet(wb, ws, 'result');
      XLSX.writeFile(wb, `${this.downLoadFileName}.xlsx`)

      this.isExporting = false;

    }, 500)

  }

}
