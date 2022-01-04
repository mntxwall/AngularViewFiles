import { Component, OnInit } from '@angular/core';
import {
  ExportPhonesResult,
  Headerindex,
  PhoneGeoHash,
  PhoneGeoHashNameCount, PhoneGeoHashNameCountNew,
  PhoneGeoHashNew,
  RowData
} from "../../headerindex";
import {Router} from "@angular/router";
import {BackendService} from "../../backend.service";

@Component({
  selector: 'app-calculate',
  templateUrl: './calculate.component.html',
  styleUrls: ['./calculate.component.css']
})
export class CalculateComponent implements OnInit {

  //用于存储导入的文本数据中分析出来的表头
  headers: string[] = [];

  tableData: string = "";

  isCalculate: boolean = false;

  //rows表示根据换行符解析出来的每行.
  // 每行中又要string数组，根据逗号解析出来的每个字段
  displayRows: RowData[] = [];


  rowsFromFile: RowData[] = [];


  //三个selectd，用于表示用户选择这三个表头使用的字段
  selectedNumbers: string = "己方号码";
  selectedDateTime: string = "截获时间*";
  selectedGEOHASH: string = "己方7位GEOHASH";
  selectedBashName: string = "基站名称";


  preCalculate: PhoneGeoHashNew = {} as PhoneGeoHashNew;
  currentCalculate: PhoneGeoHashNew = {} as PhoneGeoHashNew;

  //用来表示在查找时当前要找哪一个元素
  findValue: PhoneGeoHashNew = {} as PhoneGeoHashNew;

  //用来存储最后的结果
  resultPhonesGeoHashDataTime:ExportPhonesResult[] = [];
  //用来存储基站名称最后累计出来的值
  resultPhoneGeoHashNameCount: PhoneGeoHashNameCountNew[] = [];

  constructor(private router: Router, private service: BackendService) { }

  ngOnInit(): void {
    console.log(this.findValue == null)

    this.service.getTableData().subscribe(data => this.tableData = data);

    if (this.tableData === "") {
      this.router.navigateByUrl("/")
    } else {
      this.analyseDataValues();
      this.displayRows = this.rowsFromFile.slice(0, 5);
    }
  }

  handleDate():void {

    this.isCalculate = true;
    //记录下需要处理的列号，用表头的对应关系来确定列号
    let headerIndex = {} as Headerindex;
    headerIndex.numberIndex = this.headers.indexOf(this.selectedNumbers);
    headerIndex.dateIndex = this.headers.indexOf(this.selectedDateTime);
    headerIndex.geohashIndex = this.headers.indexOf(this.selectedGEOHASH);
    //添加一栏基站名称
    headerIndex.baseName = this.headers.indexOf(this.selectedBashName);


    setTimeout(() => {

      this.rowsFromFile.forEach(rows =>{
        this.doTheTimeCalculating(headerIndex, rows.row);
        this.doGeoHashNameCalculation(headerIndex, rows.row);
      });

      this.matchTwoResult();

      console.log(this.resultPhonesGeoHashDataTime)

      this.service.setResultDisplayData(this.resultPhonesGeoHashDataTime);
      this.router.navigateByUrl("/welcome/display");


    }, 500)

  }

  matchTwoResult():void {

    this.resultPhonesGeoHashDataTime.forEach(e => {

      //找出基站名称结果集中同样geohash的结果集
      let tmp = this.resultPhoneGeoHashNameCount.filter(f => {
        return (f.geoHash === e.geoHash && f.phone === e.phone)
      });

      //没有找到该geohash，大概率这个geohash的中文基站名字为空
      // 那么就跳过
      if (tmp.length > 0) {
        tmp.sort((g1, g2) => {
          return g1.baseNameCount < g2.baseNameCount ? 1 : -1
        });
        e.geoHashName = tmp[0].baseName;

        /*
        //把出现机场、车站、动车的字眼保存在另外的数组中
        if (e.geoHashName.includes('车站') || e.geoHashName.includes('机场')
          || e.geoHashName.includes('动车') || e.geoHashName.includes('服务区')
          || e.geoHashName.includes('高铁') || e.geoHashName.includes('客运站')) {
          this.tripPhoneGeoHahsDataTime.push(e)
        }

         */
      }
    });
  }

  doGeoHashNameCalculation(headerIndex: Headerindex, row: string[]) {

    //找到相应的数据结构，没有的话就新建一个加入到队例里，或者是map里
    //在基站名称中去掉为空的基站名称
    //console.log(row[headerIndex.baseName].trim());

    if (row[headerIndex.baseName].trim().length > 0) {
      let findPhoneGeoHashName = this.resultPhoneGeoHashNameCount.find(e => {
        return (
          e.geoHash === row[headerIndex.geohashIndex].trim() &&
          e.phone == row[headerIndex.numberIndex].trim() &&
          e.baseName === row[headerIndex.baseName].trim()
        )
      });

      if (findPhoneGeoHashName == null) {
        //this.initNewPhoneGeoHashName(row[headerIndex.baseName].trim());

        this.resultPhoneGeoHashNameCount.push({
          "phone": row[headerIndex.numberIndex].trim(),
          "geoHash":row[headerIndex.geohashIndex].trim(),
          "baseName": row[headerIndex.baseName].trim(),
          "baseNameCount":1
        })


      } else {
        findPhoneGeoHashName.baseNameCount += 1;
      }
    }


  }

  doTheTimeCalculating(headerIndex: Headerindex, row: string[]):void {

    this.currentCalculate.phone = row[headerIndex.numberIndex].trim();
    this.currentCalculate.geoHash = row[headerIndex.geohashIndex].trim();
    this.currentCalculate.inDateTime = row[headerIndex.dateIndex].trim();


    ////上下两条如果用户号码与geohash相等，说明是同一个geohash中，需要累计时间
    if (typeof (this.preCalculate.phone) !== "undefined" &&
      this.currentCalculate.geoHash === this.preCalculate.geoHash){
      this.findValue = this.currentCalculate;
    }
    else { //上下两条如果用户号码与geohash不相等，说明切换了，把Current入库，把pre的值填回去
      this.findValue = this.preCalculate;

      this.resultPhonesGeoHashDataTime.push({
        "phone": this.currentCalculate.phone,
        "geoHash": this.currentCalculate.geoHash,
        "beginTime": this.currentCalculate.inDateTime,
        "endTime": "",
        "interval": 0,
        "geoHashName": ""})
    }

    if (Object.keys(this.findValue).length !== 0){
      let findPhoneGeoHash = this.resultPhonesGeoHashDataTime.filter(e => {
        return (e.phone === this.findValue.phone && e.geoHash === this.findValue.geoHash)
      });

      findPhoneGeoHash[findPhoneGeoHash.length - 1].endTime = this.findValue.inDateTime
      findPhoneGeoHash[findPhoneGeoHash.length - 1].interval = Math.round(Math.abs((new Date(findPhoneGeoHash[findPhoneGeoHash.length - 1].endTime).getTime()
          - new Date(findPhoneGeoHash[findPhoneGeoHash.length - 1].beginTime).getTime()))
        / (1000 * 60))
    }

    this.preCalculate.inDateTime = this.currentCalculate.inDateTime;
    this.preCalculate.phone = this.currentCalculate.phone;
    this.preCalculate.geoHash = this.currentCalculate.geoHash;

  }

  analyseDataValues() {
    //把每一行都分出来
    let lines = this.tableData.split(/\r?\n/);
    let header = lines.shift();

    //再分出每一行的每个字段
    // @ts-ignore
    let tableColumns = header.split(',');

    tableColumns.forEach(column => {
      this.headers.push(column);
    });

    lines.forEach(line => {
      //去掉双引号
      //let rowValues: string[] = [];
      let rowValues: RowData = {row:[]};
      line.split(',').forEach(data => {
        let tmp = data;
        tmp = tmp.substr(0, 1) === "\"" ? tmp.substring(1, tmp.length - 1).trim() : tmp.trim();
        tmp = tmp.substr(-1, 1) === "\"" ? tmp.substring(0, tmp.length - 1).trim() : tmp.trim();
        rowValues.row.push(tmp);

      });
      this.rowsFromFile.push(rowValues);

    });

    //this.rows.shift();

  }



}
