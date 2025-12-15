function Controls(props) {
    const {
        isPaused,
        onPlay,
        onPause,
        onNext,
        onDownload,
        onSearch,
        onShowQueue,
        onUpload,
        
    } = props;

    return (
        <div style={{margin: "0 15px 15px 15px"}}>
        { isPaused ? <button onClick={onPlay}><i className="fa-solid fa-play fa-fw"></i></button> : <button onClick={onPause}><i className="fa-solid fa-pause fa-fw"></i></button>}
        &nbsp;<button onClick={onNext}><i className="fa-solid fa-forward"></i></button>
        &nbsp;<button onClick={onDownload}><i className="fa-solid fa-download"></i></button>
        &nbsp;<button onClick={onSearch}><i className="fa-solid fa-magnifying-glass"></i></button>
        &nbsp;<button onClick={onShowQueue}><i className="fa-solid fa-list"></i></button>
        &nbsp;<button onClick={onUpload}><i className="fa-solid fa-cloud-arrow-up"></i></button>
        </div>
    );
}

export default Controls;
