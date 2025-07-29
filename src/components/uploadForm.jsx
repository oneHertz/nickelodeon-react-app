import ReactResumableJs from './resumable'

function UploadForm(props) {
    return (
        <div style={{margin: "15px"}}>
        <ReactResumableJs
            filetypes={["mp3"]}
            fileAddedMessage="Started!"
            completedMessage="Complete!"
            service={props.apiRoot + "/mp3-upload"}
            textLabel=""
            previousText="Drop your MP3s here"
            disableDragAndDrop={false}
            maxFileSize={10000000000}
            headerObject={{
                Authorization: 'Token ' + props.authToken
            }}
            onFileAdded={(file, resumable) => {
              resumable.upload();
              // TODO: Track upload progress
              props.enqueueSnackbar(file.file.name + " upload started!");
            }}
            onFileSuccess={(file, server) => {
              props.enqueueSnackbar(file.file.name + " upload success!", {variant: "success"});
            }}
            startButton={false}
            pauseButton={false}
            cancelButton={false}
            onStartUpload={() => {
                console.log("Start upload");
            }}
            onCancelUpload={() => {
                this.inputDisable = false;
            }}
            onPauseUpload={() =>{
                this.inputDisable = false;
            }}
            onResumeUpload={() => {
                this.inputDisable = true;
            }}
            showFileList={true}
          />
        </div>
    );
}

export default UploadForm;
