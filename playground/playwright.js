const playwright = require('playwright');
const fs = require('fs');
const util = require('util');

const mkdir = util.promisify(fs.mkdir);
const readdir= util.promisify(fs.readdir);
const imgbbUploader = require('imgbb-uploader');

const root={
        'chromium':true
}

const URLS = ['https://google.com', 'https://facebook.com', 'https://instagram.com', 'https://steampowered.com', 'https://amazon.com', 'https://uniandes.edu.co'];

module.exports.startTests = async (config) => {
    let browser,context={};  
    let browserType = config.browserType;
    console.log("FIRST",browserType);
    try {
        const launchConfig=root[browserType]?{dumpio:true,args:['--no-sandbox']}:{dumpio:true}
        console.log(launchConfig)
        browser = await playwright[browserType].launch({dumpio:true});
        context = await browser.newContext();
    }
    catch(error){
        console.log("F me",error);
        return;
    }

    for (const URL of URLS) {
        try {
            console.log("LOOP",URL);
            const domainName = URL.split('.')[0].slice(8)
            const page = await context.newPage();
            page.setViewport(config.viewport);

            await page.goto(URL);
            console.log("INPUT");
            try {
                await page.fill('input[type=text]', 'test', 'any')
            } catch (error) {
                console.log('NoTextInput');
            }

            const basePath=`screenshots/${domainName}`;
            if (!fs.existsSync(basePath)) {
                    await mkdir(basePath,{recursive:true});
            }

            await page.screenshot({ path: `${basePath}/${browserType}-${config.viewport.width}x${config.viewport.height}.png` });
        } catch (error) {
        console.log('[rip]: ', URL, error)
        }
    }

    uploadImages(URLS);
    console.log("CLOSE");
    await browser.close();
};

const uploadImages= async (URLS)=>{
    for (const URL of URLS) {
       const domainName = URL.split('.')[0].slice(8)
       const basePath=`screenshots/${domainName}`
       const files=await readdir("./"+basePath)
       for (const name of files){
          imgbbUploader("1e75677e91c29adddfd31298730553cd", `${basePath}/${name}`)
                  .then(response => console.log(response))
                  .catch(error => console.error(error))
       }
    }
  }
