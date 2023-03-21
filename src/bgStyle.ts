const bgStyle = (styleOption : any, css : any)=>{
    setBgColor(styleOption,css);
    setBorderWidth(styleOption,css);
    setBorderColor(styleOption,css);
    setBorderStyle(styleOption,css);
    
    return css;
}

const setBgColor = (option: any, css : object)=>{
let bgColor = option.bgColor;
    if(bgColor){
        css["background-color"] = bgColor;
    }
}


const setBorderWidth = (option: any, css : object)=>{
    let borderWidth = option.borderWidth;
    
    if(borderWidth){
        let _width = `${borderWidth.top}px ${borderWidth.right}px ${borderWidth.bottom}px ${borderWidth.left}px`
        css["border-width"] = _width;
    }
}
const setBorderColor = (option: any, css : object)=>{
    let borderColor = option.borderColor;
    if(borderColor){
        css["border-color"] = borderColor;
    }
}
const setBorderStyle = (option: any, css : object)=>{
    let borderStyle = option.borderStyle;
        if(borderStyle){
            css["border-style"] = borderStyle;
        }
    }

export default bgStyle;
