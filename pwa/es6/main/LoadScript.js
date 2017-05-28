/**
 * Created by Benjamin on 28-05-2017.
 */


export default function LoadScript(url){
    return new Promise((resolve, reject)=>{
        const script = document.createElement('script');
        script.src = url;

        script.onload = resolve;
        script.onerror = reject;

        document.head.appendChild(script);
    })
}
