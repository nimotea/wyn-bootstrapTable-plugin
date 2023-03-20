import '../style/visual.less';
import $ from 'jquery';
import 'bootstrap-table/dist/bootstrap-table.min.css';
import 'bootstrap-table';
import 'bootstrap-table/dist/bootstrap-table-locale-all.min.js'
// import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-css';
import 'bootstrap';


export default class Visual extends WynVisual {

  private static defaultConfig: object = {
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
  ]  
};
  private styleConfig : any;
  private renderConfig : object;
  private selectionManager: any;
  private selectionIds: any;
  private host: VisualNS.VisualHost;
  private dom: HTMLDivElement;
  private options: VisualNS.IVisualUpdateOptions;
  private profile: any;

  
  

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
    const root= this;

    $("#_table").bootstrapTable(Visual.defaultConfig);
    $("#_table").on('click-row.bs.table',function(row, ele, field){
      root.selectData(ele as any);
      root.leftClick(row.pageX,row.pageY);
    })
  }

  public selectData(ele:any){
    this.selectionManager.clear();
    this.host.toolTipService.hide();
    this.host.contextMenuService.hide();

    // this.selectionManager.clear();
    const selectionId = this.host.selectionService.createSelectionId();
    //keys
    const profile_key = this.profile.dimensions.values.map((pro)=>{
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
    const style=this.styleConfig;
    const plainDataView = options.dataViews[0] && options.dataViews[0].plain;
    if (plainDataView) {
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
      this.renderConfig = Visual.defaultConfig;
    }
    this.render();
  }

  public selectEvent(){
    const onMouseDown = (event:MouseEvent) => {
      console.log("点击图表");
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
    console.log("右键点击了");
        this.host.contextMenuService.show({
          position : {
            x : event.clientX,
            y : event.clientY
          }
        })
  }

}

public leftClick(pageX : number,pageY :number){
  console.log("执行命令了");
  
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
    return null;
  }

  public getActionBarHiddenState(options: VisualNS.IVisualUpdateOptions): string[] {
    return null;
  }

  public getColorAssignmentConfigMapping(dataViews: VisualNS.IDataView[]): VisualNS.IColorAssignmentConfigMapping {
    return null;
  }
}