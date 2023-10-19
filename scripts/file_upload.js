function save(file,name,path){
    return new Promise((resolve)=>{
        const uploadedFile = file[name];
        const uploadPath = path + uploadedFile.name;

        let out  = {'status':'File uploaded','filename':uploadedFile.name,'size':uploadedFile.size,'encoding':uploadedFile.encoding}
    
        if (!file || Object.keys(file).length === 0) {
            out['status'] = 'No files uploaded'
            return resolve(out)
        }
    
        uploadedFile.mv(uploadPath, (err) => {
            if (err) {
                out['status'] = 'err in file upload'
                out['err'] = err
                return resolve(out)
            }
            else{
                out['status'] = 'File uploaded'
                return resolve(out)
            }
        });
    })
}

module.exports = save