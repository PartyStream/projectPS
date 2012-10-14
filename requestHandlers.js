function start()
{
    console.log("Request handle 'start' was called.");
}

function upload()
{
    console.log("Request handle 'upload' was called.");
}

exports.start  = start;
exports.upload = upload;