const FIX_TABLE_PAGE = ".fixed-table-pagination";
const PAGE_LINK = ".page-link";
const HOVER_PAGE_LINK = ".page-link:hover";
const ACTIVE_PAGE_LINK = ".active .page-link"

const DROPDOWN_MENU = ".dropdown-menu";
const DROPDOWN_ITEM = ".dropdown-item";
const ACTIVE_DROPDOWN = ".dropdown-item.active";
const HOVER_DROPDOWN_ITEM = ".dropdown-item:hover";

const BUTTON = ".btn.btn-secondary.dropdown-toggle";


const overrideStyle = (styleOption : any) : String =>{
    let _styleNode = `<style>`
    // _styleNode += setBodyStyle(styleOption) || "";
    _styleNode += setPageBlockStyle(styleOption)||"";
    _styleNode += setPageLinkStyle(styleOption)||"";
    _styleNode += setPageActiveStyle(styleOption)||"";
    _styleNode += setPageLink(styleOption)||"";
    _styleNode += setButtonStyle(styleOption)||"";
    
    _styleNode +=`</style>`;
    return _styleNode;
}
const makeCssValueImportant = (value) : String =>{
    return value + " !important";
}

const setBodyStyle = (option: any) : String =>{
    return "";
}

const setButtonStyle = (option : any) : String =>{
    const _css = {};
    const buttonBgColor = option.buttonBgColor;
    const buttonColor = option.buttonColor;
    if(buttonBgColor){
        _css["background-color"] = makeCssValueImportant(buttonBgColor);
    }
    if(buttonColor){
        _css["color"] = makeCssValueImportant(buttonColor);
    }
    return ` ${BUTTON} ${JsonCssStringify(_css)}
            `;
}

const setPageActiveStyle = (option : any) : String =>{
    const _css = {};
    const pageActiveColor = option.pageActiveColor;
    if(pageActiveColor){
        _css["background-color"] = makeCssValueImportant(pageActiveColor);
    }
    return ` ${ACTIVE_PAGE_LINK} ${JsonCssStringify(_css)}
             ${ACTIVE_DROPDOWN} ${JsonCssStringify(_css)}
             ${HOVER_DROPDOWN_ITEM} ${JsonCssStringify(_css)}
             ${HOVER_PAGE_LINK} ${JsonCssStringify(_css)}
            `;
}

const setPageLink = (option : any) : String =>{
    const _css = {}
    let borderWidth = option.borderWidth;
    let textAlign = option.textAlign;
    let borderColor = option.borderColor;
    let borderStyle = option.borderStyle;

    if(borderWidth){
        let _width = `${borderWidth.top}px ${borderWidth.right}px ${borderWidth.bottom}px ${borderWidth.left}px`
        _css["border-width"] = makeCssValueImportant(_width); 
    }
    if(textAlign){
        _css["text-align"] = makeCssValueImportant(textAlign); 
    }
    if(borderColor){
        _css["border-color"] = makeCssValueImportant(borderColor); 
    }
    if(borderStyle){
        _css["border-style"] = makeCssValueImportant(borderStyle); 
    }
    
    return ` ${PAGE_LINK} ${JsonCssStringify(_css)}
            `;
}

const setPageBlockStyle = (option: any) :String =>{
    const _css = {}
    const bgColor = option.bgColor;
    const fontStyle = option.fontStyle;
    if(fontStyle.fontFamily){
        _css["font-size"] = makeCssValueImportant(fontStyle["fontSize"]);
        _css["font-family"] = makeCssValueImportant(fontStyle["fontFamily"]);
        _css["font-weight"] = makeCssValueImportant(fontStyle["fontWeight"]);
        _css["font-style"] = makeCssValueImportant(fontStyle["fontStyle"]);
        _css["color"] = makeCssValueImportant(fontStyle["color"]);
    }
    if(bgColor){
        _css["background-color"] = makeCssValueImportant(bgColor); 
    }
    
    return ` ${FIX_TABLE_PAGE} ${JsonCssStringify(_css)}
             ${DROPDOWN_MENU} ${JsonCssStringify(_css)}
             ${DROPDOWN_ITEM} ${JsonCssStringify(_css)}
             ${PAGE_LINK} ${JsonCssStringify(_css)}
            `;
}
const setPageLinkStyle = (option: any) :String =>{
  return "";  
}

const JsonCssStringify = (css: any) :String =>{
    let keys = Object.keys(css);
    let str = JSON.stringify(css);
    str = str.replace(new RegExp('"','g'),"");
    str = str.replace(new RegExp(",","g"),";"); 
    return str.replace(/\(.*\)/g,function(x){return x.replace(/;/g,",")})
  }




export default overrideStyle;
