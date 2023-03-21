import $ from 'jquery';
import 'bootstrap';
import 'bootstrap-table';
import 'bootstrap-table/dist/bootstrap-table-locale-all.min.js'

import '../style/visual.less';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-table/dist/bootstrap-table.min.css';

import textStyle from './textStyle';
import bgStyle from './bgStyle';

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
  private static rowPrefix : string = "__row__";
  
  

  constructor(dom: HTMLDivElement, host: VisualNS.VisualHost, options: VisualNS.IVisualUpdateOptions) {
    super(dom, host, options);
    
    // document.oncontextmenu = function () { return false; };


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

    $("#_table").bootstrapTable(Visual.defaultConfig);
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
  // custom cellStyle
  public cellStyle(value:any,row:number,index:number){
    
  }

  public update(options: VisualNS.IVisualUpdateOptions) {
    this.styleConfig = options.properties;
    this._resolveStyle= this.stylePropFilter();

    Visual.defaultConfig.headerStyle = this.headerStyle;
    Visual.defaultConfig.rowStyle = this.rowStyle;
    Visual.defaultConfig.footerStyle = this.footerStyle;
    
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

      
      this.renderConfig = $.extend({},Visual.defaultConfig,{
        columns:_columns,
        data:plainDataView.data
      });
    }else{
      Visual.root.isMock = true;
      this.renderConfig = Visual.defaultConfig;
    }
    this.render();
  }

  public stylePropFilter(){
    const globalConfig = {};
    const headerConfig = {};
    const rowConfig = {};
    const globalPrefix = Visual.globalPrefix;
    const headPrefix = Visual.headPrefix;
    const rowPrefix = Visual.rowPrefix;

    Object.keys(Visual.root.styleConfig).map(item=>{
      if(item.indexOf(globalPrefix)>-1){
        globalConfig[item.replace(globalPrefix,"")]=Visual.root.styleConfig[item];
        return 
      }else if(item.indexOf(headPrefix)>-1){
        headerConfig[item.replace(headPrefix,"")]=Visual.root.styleConfig[item];
        return 
      }else if(item.indexOf(rowPrefix)>-1){
        rowConfig[item.replace(rowPrefix,"")]=Visual.root.styleConfig[item];
        return 
      }
    })

    return {
      global : globalConfig,
      header : headerConfig,
      row : rowConfig
    }
  }
  
  public headerStyle(){
    const _css =  {};
     const globalConfig = Visual.root._resolveStyle.global;
     const headerConfig = Visual.root._resolveStyle.header;
     textStyle($.extend({},globalConfig,headerConfig["enable"] && headerConfig || {}),_css);
     bgStyle($.extend({},globalConfig,headerConfig["enable"] && headerConfig || {}),_css);
     return { css : _css}
  }

  public footerStyle(){
  /*   const _css =  {};
     textStyle(Visual.root.styleConfig,_css);
     return { css : _css} */
  }

  public rowStyle(){
    const _css =  {};
    const globalConfig = Visual.root._resolveStyle.global;
     const rowConfig = Visual.root._resolveStyle.row;
     textStyle($.extend({},globalConfig,rowConfig["enable"] && rowConfig || {}),_css);
     bgStyle($.extend({},globalConfig,rowConfig["enable"] && rowConfig || {}),_css);
     return { css : _css}
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
    Object.keys(styleConfig).map(key=>{
      if(isHiddenHeader && key!= "__head__enable" && key.indexOf(Visual.headPrefix)>-1){
        hiddenKey.push(key);
        return;
      }
      
      if(isHiddenRow && key!= "__row__enable" && key.indexOf(Visual.rowPrefix)>-1){
        hiddenKey.push(key);
        return;
      }
    })
    return hiddenKey;
  }

  public onResize(){
    console.log("start resize!");
    
    $("#_table").bootstrapTable('refresh');
    $("#_table").bootstrapTable(this.renderConfig);
  }

  public getActionBarHiddenState(options: VisualNS.IVisualUpdateOptions): string[] {
    return null;
  }

  public getColorAssignmentConfigMapping(dataViews: VisualNS.IDataView[]): VisualNS.IColorAssignmentConfigMapping {
    return null;
  }
}