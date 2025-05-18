import React, { useState } from "react";
import styles from '../Styles/SearchPage.module.css';
import TextField from '@mui/material/TextField';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import Dialog from '@mui/material/Dialog';
import { IconButton } from "@mui/material";

export default function SearchPage() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>

        <div className={styles.inputContainer}>
             <TextField
          fullWidth
          label="SEARCH"
          id="inputId"
          className={styles.input}
           sx={{

            "& .MuiInputLabel-root.Mui-focused": {
                color: "black",
              },
              
              "& .MuiOutlinedInput-root": {
                
                "& fieldset": {
                  borderColor: "gray",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "gray",
                  borderWidth: 1,
                },
                "& .MuiInputBase-input": {
                  textTransform: "uppercase",
                   cursor: "pointer",
                },
                "&.Mui-focused .MuiInputBase-input": {
                  cursor: "text",
                },
              },
            }}
        />
        </div>
        <div className={`${styles.iconContainer} ${styles.filterIcon}`}>
            <IconButton>
                <FilterListOutlinedIcon onClick={handleClickOpen} aria-label="Open filters" className={styles.icon} />
            </IconButton>
        </div>
        
      </header>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="filters-dialog-title"
        PaperProps={{
          style: {
            minWidth: '500px',
            minHeight: '500px',
          },
        }}
      >
        {/* Empty for now*/}
      </Dialog>
    </div>
  );
}