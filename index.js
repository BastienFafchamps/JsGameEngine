function loadScript(scriptUrl) {
    const script = document.createElement('script');
    script.src = scriptUrl;
    document.body.appendChild(script);

    return new Promise((res, rej) => {
        script.onload = res;
        script.onerror = rej;
    });
}

// use
loadScript('http://your-cdn/jquery.js')
.then(() => {
    console.log('Script loaded!');
})
.catch(() => {
    console.error('Script loading failed! Handle this error');
});