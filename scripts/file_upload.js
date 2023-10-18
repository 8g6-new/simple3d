function save(files,n){
    return new Promise((resolve)=>{
        const uploadedFile = files[n];
        const uploadPath = __dirname + '/uploads/' + uploadedFile.name;

        let out  = {'status':'File uploaded','filename':uploadedFile.name}
    
        if (!files[n] || Object.keys(files[n]).length === 0) {
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