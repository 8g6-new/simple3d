function save(file,name,path){
    return new Promise((resolve)=>{
            let out  = {'status':''}
            try{
                const uploadedFile = file[name];
                const uploadPath = path + uploadedFile.name;
        
            
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
                        out['filename'] = uploadedFile.name
                        out['size']     = uploadedFile.size
                        out['encoding'] = uploadedFile.encoding
                        out['status'] = 'File uploaded'
                        return resolve(out)
                    }
                });
            }
            catch(e){
                out['status'] = 'No files uploaded'
                return resolve(out)
            }
                
    })   
        
}

module.exports = save