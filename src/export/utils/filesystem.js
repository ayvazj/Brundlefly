function FileSystem() {}


FileSystem.prototype.baseName = function(str) {
    var base = new String(str).substring(str.lastIndexOf('/') + 1); 
    if(base.lastIndexOf(".") != -1)       
        base = base.substring(0, base.lastIndexOf("."));
    return base;
}


FileSystem.prototype.copyFolder = function(sourceFolder, destinationFolder) {  
    var sourceChildrenArr = sourceFolder.getFiles();  
    for (var i = 0; i < sourceChildrenArr.length; i++) {  
        var sourceChild = sourceChildrenArr[i];  
        var destinationChildStr = destinationFolder.fsName + "/" + sourceChild.name;  
        if (sourceChild instanceof File) {  
            copyFile(sourceChild, new File(destinationChildStr));  
        }  
        else {  
            copyFolder(sourceChild, new Folder(destinationChildStr));  
        }  
    }  
}  

FileSystem.prototype.createFolder = function(folder) {  
    if (folder.parent !== null && !folder.parent.exists) {  
        this.createFolder(folder.parent);
    }  
    folder.create();  
}
      
FileSystem.prototype.copyFile = function(sourceFile, destinationFile) {  
    this.createFolder(destinationFile.parent);  
    sourceFile.copy(destinationFile);  
}  
      
      

