import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { IconButton } from "@material-ui/core";
import { Input } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import AddBoxOutlinedIcon from "@material-ui/icons/AddBoxOutlined";
import firebase from "firebase";
import { storage, db } from "./firebase";
import "./ImageUpload.css";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  input: {
    display: "none",
  },
}));

function ImageUpload({ username }) {
  const classes = useStyles();
  const [image, setImage] = useState(null);
  //   const [url,setUrl]  = useState("")
  const [progress, setProgress] = useState(0);
  const [caption, setCaption] = useState("");

  const handleChange = (e) => {
    if (e.target.files[0]) {
    //   console.log(e.target.files);
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = (e) => {
    const uploadTask = storage.ref(`images/${image.name}`).put(image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        //progress function...
        //as image is uploading give me snapshot of waiting time
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      (error) => {
        //Error function
        console.log(error);
        alert(error.message);
      },
      () => {
        //upload is complete
        storage
          .ref("images")
          .child(image.name)
          .getDownloadURL()
          .then((url) => {
            db.collection("posts").add({
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              caption: caption,
              imageUrl: url,
              username: username,
            });

            setProgress(0); //setProgress to 0 when uploaded
            setCaption("");
            setImage(null);
          });
      }
    );
  };

  return (
    <div className={`${classes.root} imageUpload`}>
      <Input
        type="text"
        placeholder="Enter Caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />

      <div className="ImageUpload__end">
        <input
          accept="image/*"
          className={classes.input}
          id="icon-button-file"
          type="file"
          onChange={handleChange}
        />
        <label htmlFor="icon-button-file">
          <IconButton color="secondary" aria-label="upload picture" component="span">
            <AddBoxOutlinedIcon />
          </IconButton>
        </label>
        <Button onClick={handleUpload}>Upload</Button>
        <CircularProgress variant="static" value={progress} max="100" />
      </div>
    </div>
  );
}

export default ImageUpload;
