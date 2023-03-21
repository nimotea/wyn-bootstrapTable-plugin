const textStyle = (styleOption : any, css : any)=>{
    setextFont(styleOption,css);
    setextAlign(styleOption,css);
    return css;
}

const setextFont = (option: any, css : object)=>{
let fontStyle = option.fontStyle;
if(fontStyle.fontFamily){
    css["font-size"] = fontStyle["fontSize"]
    css["font-family"] = fontStyle["fontFamily"]
    css["font-weight"] = fontStyle["fontWeight"]
    css["font-style"] = fontStyle["fontStyle"]
    css["color"] = fontStyle["color"]
}

}   



const setextAlign = (option: any, css : object)=>{
    let textAlign = option.textAlign;
    if(textAlign){
        switch(textAlign){
            case "left":
                css["text-align"] = "left";
                break;
            case "center":
                css["text-align"] = "center";
                break;
            case "right":
                css["text-align"] = "right";
                break;
        }
    }
}



export default textStyle;