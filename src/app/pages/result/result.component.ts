import { Component, OnInit } from '@angular/core';
import {BackendService} from "../../backend.service";
import {ExportPhonesResult} from "../../headerindex";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {

  displayPhonesGeoHashDataTime: ExportPhonesResult[] = [];

  downLoadFileName: string = "";

  isExporting = false;


  constructor(private service: BackendService) { }

  ngOnInit(): void {

    this.service.getExportGeoHashDataTime().subscribe(data =>{
      this.displayPhonesGeoHashDataTime = data;
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
