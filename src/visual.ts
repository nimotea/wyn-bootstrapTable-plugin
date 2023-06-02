import $ from 'jquery';
import 'bootstrap';
import 'bootstrap-table';
import 'bootstrap-table/dist/bootstrap-table-locale-all.min.js'

import '../style/visual.less';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-table/dist/bootstrap-table.min.css';
import '../style/external.less';

import textStyle from './textStyle';
import bgStyle from './bgStyle';
import overrideStyle from './overrideStyle';
// import '@mdi/font/css/materialdesignicons.min.css';

export default class Visual extends WynVisual {

  private static defaultConfig: any = {
    pagination: true,
    // pageSize:20,
    locale:'zh-CN',
    pageList:[10, 25, 50, 100, 200],
    columns: [{
      field: 'id',
      sortable:true,
      title: 'Item ID'
    }, {
      field: 'name',
      title: 'Item Name'
    }, {
      field: 'price',
      title: 'Item Price'
    }],
    data: [{
      id: 1,
      name: 'Item 1',
      price: '$1'
    }
  ],
  showJumpTo: "true",
  paginationParts: ['pageList','pageSize','pageInfoShort'],
  paginationSuccessivelySize : 0,
  paginationPagesBySide:1,
  paginationDetailHAlign:'left'
};
  private styleConfig : any;
  private _resolveStyle : any;
  private renderConfig : object;
  private selectionManager: any;
  private selectionIds: any;
  private host: VisualNS.VisualHost;
  private dom: HTMLDivElement;
  private options: VisualNS.IVisualUpdateOptions;
  private profile: any;
  private isMock : boolean = true;
  
  private static root : Visual;

  private static globalPrefix : string = "__tab__";
  private static headPrefix : string = "__head__";
  
  private static rowPrefix : string = "__row";
  private static oddRowPrefix : string = "__rowOdd__";
  private static evenRowPrefix : string = "__rowEven__";
  private static pagePrefix : string = "__page__";
  
  

  constructor(dom: HTMLDivElement, host: VisualNS.VisualHost, options: VisualNS.IVisualUpdateOptions) {
    super(dom, host, options);
    
    // document.oncontextmenu = function () { return false; };
    // dom.style.backgroundColor="rgba(0,0,0,0)";


    // init global manager;
    this.selectionIds = [];
    this.host = host;
    this.dom = dom;
    this.selectionManager = host.selectionService.createSelectionManager();
    this.options = options.properties;
    this.selectEvent();

    const table = document.createElement("table") as HTMLTableElement;
    table.id ="_table";
    dom.appendChild(table);
    Visual.root= this;

    // $("#_table").bootstrapTable(Visual.defaultConfig);
    $("#_table").on('click-row.bs.table',function(row, ele, field){
      if(!Visual.root.isMock){
        Visual.root.selectData(ele as any);
        Visual.root.leftClick(row.pageX,row.pageY);
      }
    })
  }

  public selectData(ele:any){
    this.selectionManager.clear();
    this.host.toolTipService.hide();
    this.host.contextMenuService.hide();

    // this.selectionManager.clear();
    const selectionId = this.host.selectionService.createSelectionId();
    //keys
    this.profile.dimensions.values.map((pro)=>{
      selectionId.withDimension(pro,ele)
      console.log(ele[pro.display]);
    })
    this.selectionManager.select(selectionId,true);

  }
 
  public update(options: VisualNS.IVisualUpdateOptions) {
    this.styleConfig = options.properties;
    this._resolveStyle= this.stylePropFilter();

    Visual.defaultConfig.headerStyle = this.headerStyle;
    Visual.defaultConfig.rowStyle = this.rowStyle;
    Visual.defaultConfig.footerStyle = this.footerStyle;
    this.resolveGlobalStyle();
    this.resolvePageStyle();

    
    const plainDataView = options.dataViews[0] && options.dataViews[0].plain;
    if (plainDataView) {
      Visual.root.isMock = false;
      this.profile = plainDataView.profile;        
      // dimensions columns
      const _columns=plainDataView.profile.dimensions.values.map((x)=>(
        {
          title: x.display,
          field: x.display,
          sortable:true,
        visible: true
        }));
      // measures columns  
      plainDataView.profile.data.values.map((measure)=>{
        _columns.push({
          title: measure.display,
          field: measure.display,
          sortable:true,
          visible: true
        })
      });

      // addCellStyle for columns
      this.addColumnCellStyle(_columns);
      this.addColumnFormatter(_columns);
      

      this.renderConfig = $.extend({},Visual.defaultConfig,{
        columns:_columns,
        data:plainDataView.data
      });
      this.fixTableHeight(this.renderConfig);
    }else{
      Visual.root.isMock = true;
      this.renderConfig = Visual.defaultConfig;
    }
    this.render();
  }

  public fixTableHeight(option : any) {
    const height = Visual.root.dom.offsetHeight;
    option["height"]=height;
  }

  public addColumnCellStyle(_columns : any){
    const columnOption = Visual.root._resolveStyle.global["columnOption"];
    _columns.map(colConfig=>{
      const colStyle = columnOption.filter((style)=>(style["column_name"]==colConfig["title"]));
      if(colStyle && colStyle.length){
        colStyle.map(col=>{
          colConfig["cellStyle"] = this.genCellStyle(col);
          if(col.width){
            colConfig["width"] = col.width;
          }
        })
      }
    })

  }

  public addColumnFormatter(_columns : any) {
    const colFormatter = [];
     this.profile.data.values.map(colMeta=>{
      if(colMeta.options["itemFormat"]){
         colFormatter.push({
          columnName : colMeta.display,
          itemFormat : colMeta.options.itemFormat
         })
      }
    });

    _columns.forEach(element => {
      colFormatter.forEach(col=>{
        if(element.title == col.columnName && col.itemFormat){
          element.formatter = this.genValueFormatter(col.itemFormat);
        }
      }
      )
    });
  }

  public genValueFormatter(itemFormat:string){
    return function(value,row){
     return Visual.root.host.formatService.format(itemFormat,value)
    }
  }

  // cellStyle function factory
  public genCellStyle(styleConfig){
    const globalConfig = Visual.root._resolveStyle.global;
     const oddRowConfig = Visual.root._resolveStyle.oddRow;
     const evenRowConfig = Visual.root._resolveStyle.evenRow;
    let _oddCss =  {};
     textStyle($.extend({},globalConfig,Visual.root.styleConfig["__row__enable"] && oddRowConfig ,styleConfig),_oddCss);
     bgStyle($.extend({},globalConfig,Visual.root.styleConfig["__row__enable"] && oddRowConfig ,styleConfig),_oddCss);
    let _evenCss = {}; 
    textStyle($.extend({},globalConfig,Visual.root.styleConfig["__row__enable"] && evenRowConfig ,styleConfig),_evenCss);
     bgStyle($.extend({},globalConfig,Visual.root.styleConfig["__row__enable"] && evenRowConfig ,styleConfig),_evenCss);
     
     return function (value,row,index){ 
      console.log(`cell info: ${value},${JSON.stringify(row)},${index}`);
      if(index % 2 ==0){
      return {css : _evenCss}
      }else {
      return {css : _oddCss}
      }
   }
  }


  public stylePropFilter(){
    const globalConfig = {};
    const headerConfig = {};
    const oddRowConfig = {};
    const evenRowConfig = {};
    const pageConfig = {};
    const globalPrefix = Visual.globalPrefix;
    const headPrefix = Visual.headPrefix;
    const oddRowPrefix = Visual.oddRowPrefix;
    const evenRowPrefix = Visual.evenRowPrefix;
    const pagePrefix = Visual.pagePrefix;

    Object.keys(Visual.root.styleConfig).map(item=>{
      if(item.indexOf(globalPrefix)>-1){
        globalConfig[item.replace(globalPrefix,"")]=Visual.root.styleConfig[item];
        return 
      }else if(item.indexOf(headPrefix)>-1){
        headerConfig[item.replace(headPrefix,"")]=Visual.root.styleConfig[item];
        return 
      }else if(item.indexOf(oddRowPrefix)>-1){
        oddRowConfig[item.replace(oddRowPrefix,"")]=Visual.root.styleConfig[item];
        return 
      }else if(item.indexOf(evenRowPrefix)>-1){
        evenRowConfig[item.replace(evenRowPrefix,"")]=Visual.root.styleConfig[item];
        return 
      }else if(item.indexOf(pagePrefix)>-1){
        pageConfig[item.replace(pagePrefix,"")]=Visual.root.styleConfig[item];
        return 
      }
    })

    return {
      global : globalConfig,
      header : headerConfig,
      oddRow : oddRowConfig,
      evenRow : evenRowConfig,
      page : pageConfig
    }
  }
  
  public headerStyle(){
    const _css =  {};
     const globalConfig = Visual.root._resolveStyle.global;
     const headerConfig = Visual.root._resolveStyle.header;
     textStyle($.extend({},globalConfig,headerConfig["enable"] && headerConfig || {}),_css);
     bgStyle($.extend({},globalConfig,headerConfig["enable"] && headerConfig || {}),_css);
     _css["border-bottom-width"]=`0px`;
     return { css : _css}
  }

  public footerStyle(){
  /*   const _css =  {};
     textStyle(Visual.root.styleConfig,_css);
     return { css : _css} */
  }

  public rowStyle(row : any,index){
    const _css =  {};
    const globalConfig = Visual.root._resolveStyle.global;
     const oddRowConfig = Visual.root._resolveStyle.oddRow;
     const evenRowConfig = Visual.root._resolveStyle.evenRow;
     if(index%2==0){
     textStyle($.extend({},globalConfig,Visual.root.styleConfig["__row__enable"] && oddRowConfig || {}),_css);
     bgStyle($.extend({},globalConfig,Visual.root.styleConfig["__row__enable"] && oddRowConfig || {}),_css);
     return { css : _css}
     }else {
      textStyle($.extend({},globalConfig,Visual.root.styleConfig["__row__enable"] && evenRowConfig || {}),_css);
     bgStyle($.extend({},globalConfig,Visual.root.styleConfig["__row__enable"] && evenRowConfig || {}),_css);
     return { css : _css}
     }
  }

   


  public resolveGlobalStyle(){
    const _css =  {};

     const globalConfig = Visual.root._resolveStyle.global;
    //  bgStyle($.extend({},globalConfig),_css);
     textStyle($.extend({},globalConfig),_css);
     // global plugin always none-border
     _css["border-width"] = 0;
     this.hardCodeStyle();
     $(this.dom).css(_css);
     
     
  }

  public hardCodeStyle(){
    const globalConfig = Visual.root._resolveStyle.global;
    this.dom.style.backgroundColor = globalConfig.dombgColor;
    $(this.dom).append(
      `<style>
      .fixed-table-border {
            background-color : ${globalConfig.dombgColor} !important;
          }
       </style>
      `

    )
  }

  public resolvePageStyle(){
    const globalConfig = Visual.root._resolveStyle.global;
     const pageConfig = Visual.root._resolveStyle.page;
     $(this.dom).append(overrideStyle($.extend({},globalConfig,pageConfig["enable"] && pageConfig || {})));
  }

  

  

  public selectEvent(){
    const onMouseDown = (event:MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      this.host.contextMenuService.hide();
    this.dom.addEventListener('pointerup', onMouseUp, true);
  }

  this.dom.addEventListener('pointerdown', onMouseDown, true);



   const onMouseUp = (event:MouseEvent) =>{

    if(event.button === 2){
      rightClick(event);
    }else{
      return false;
    }
  } 

  const rightClick = (event:MouseEvent) => {
    document.oncontextmenu = function () { return false; };
    document.oncontextmenu = function () { return false; };
        this.host.contextMenuService.show({
          position : {
            x : event.clientX,
            y : event.clientY
          }
        })
  }

}

public leftClick(pageX : number,pageY :number){
  
  const selectionIds = this.selectionManager.getSelectionIds();
  if(this.options.clickLeftMouse != 'none'){
  this.host.commandService.execute([{
    name: this.options.clickLeftMouse,
    payload: {
      selectionIds: selectionIds,
      position: {
        x: pageX,
        y: pageY,
      },
    }
  }])
}
}

  public render(){
    $("#_table").bootstrapTable('destroy');
    $("#_table").bootstrapTable(this.renderConfig);

  }

 
  

  public onDestroy(): void {

  }

  public getInspectorHiddenState(options: VisualNS.IVisualUpdateOptions): string[] {
    const styleConfig = options.properties;
    let hiddenKey = [];
    let isHiddenHeader = (styleConfig["__head__enable"] == false);
    let isHiddenRow = (styleConfig["__row__enable"] == false);
    let isHiddenPage = (styleConfig["__page__enable"] == false);

    // __tab__height 只作为 __head__height 的默认值存在
    hiddenKey.push("__tab__height")

    Object.keys(styleConfig).map(key=>{
      if(isHiddenHeader && key!= "__head__enable" && key.indexOf(Visual.headPrefix)>-1){
        hiddenKey.push(key);
        return;
      }
      
      if(isHiddenRow && key!= "__row__enable" && key.indexOf(Visual.rowPrefix)>-1){
        hiddenKey.push(key);
        return;
      }

      if(isHiddenPage && key!= "__page__enable" && key.indexOf(Visual.pagePrefix)>-1){
        hiddenKey.push(key);
        return;
      }
    })
    return hiddenKey;
  }



  public getActionBarHiddenState(options: VisualNS.IVisualUpdateOptions): string[] {
    return null;
  }

  public getColorAssignmentConfigMapping(dataViews: VisualNS.IDataView[]): VisualNS.IColorAssignmentConfigMapping {
    return null;
  }
}