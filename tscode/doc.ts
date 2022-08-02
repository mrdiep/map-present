import * as YAML from 'yaml'
import { getSort } from './configs';
import { RawInputSchema, remapModel, ScriptRunnerSchema } from "./mapping";
import { parseLatLng } from './utils';

export const setIntro = (intro: string) => {
    const element = document.getElementById("message");
    if (element) element.innerHTML = intro;
}

export const hideArroundHtmlList = () => {
    const element = document.getElementById("liveAlertPlaceholder");
    if (element) element.style.display = "none";
}

export const showArroundHtmlList = () => {
    const element = document.getElementById("liveAlertPlaceholder");
    if (element) element.style.display = "inline";
}

export const loadScriptToRun = () => {
    const element = document.getElementById("codeArea") as HTMLTextAreaElement;
    if (!element) return;
    element.value = localStorage.getItem("code") as string;
}

export const getScriptToRun = () : ScriptRunnerSchema => {
    const element = document.getElementById("codeArea") as HTMLTextAreaElement;
    if (!element) return {} as ScriptRunnerSchema;
    const scriptToRun = element.value;
    localStorage.setItem("code", scriptToRun);
    const raw = YAML.parse(scriptToRun) as RawInputSchema;
    const sort = getSort();
    raw['xung quanh'] = raw['xung quanh'].sort((a, b) => 
      google.maps.geometry.spherical.computeDistanceBetween(parseLatLng(a['tọa độ']), parseLatLng(raw['vị trí đất'])) >
      google.maps.geometry.spherical.computeDistanceBetween(parseLatLng(b['tọa độ']), parseLatLng(raw['vị trí đất'])) ?
       0 - sort : sort);
    localStorage.setItem('code', YAML.stringify(raw))

    const model = remapModel(raw);
     
    return model;

    //return {} as ScriptRunnerSchema;
}

export const showHtmlMap = () => {
    const codeElement = document.getElementById("code");
    const contentElement = document.getElementById("content");
    if (codeElement) {
        codeElement.style.display = "none";
    }
    if (contentElement) {
        contentElement.style.display = "inline";
    }
}

export const showAlert = (message, type) => {
    const alertPlaceholder = document.getElementById("liveAlertPlaceholder") as HTMLElement;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        "</div>",
    ].join("");

    alertPlaceholder.append(wrapper);
};

export const getFromLocalStore = (): RawInputSchema => {
    const code = localStorage.getItem('code');
    if (!code) return null as any;
    const script = YAML.parse(code) as RawInputSchema;
    return script;
}

export const setLabelRouteLabelLocation = (index: number, newLocation: google.maps.LatLng | null | undefined) => {
    if (!newLocation) return;
    const data = getFromLocalStore() as RawInputSchema;
    data['xung quanh'][index]['vị trí nhãn'] = `${newLocation.lat()}, ${newLocation.lng()}`

    localStorage.setItem('code', YAML.stringify(data))
}   

export const addMoreArround = (name: string, distanceMode: string, newLocation: google.maps.LatLng | null | undefined) => {
    if (!newLocation) return;
    const data = getFromLocalStore() as RawInputSchema;
    data['xung quanh'].push({
        'tên': name,
        'tọa độ': `${newLocation.lat()}, ${newLocation.lng()}`,
        'cách đo': distanceMode || 'lái xe'
    });

    localStorage.setItem('code', YAML.stringify(data))
}