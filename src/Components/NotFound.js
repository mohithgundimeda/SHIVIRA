import React from "react";
import styles from '../Styles/NotFound.module.css';
import { Link } from "react-router-dom";

export default function NotFound(){
    return(<div className={styles.container}>

            <div className={styles.notf}>
                <span>NOTHING</span> <span>FOUND</span>
            </div>

            <div><p className={styles.explanation}>THE PAGE YOU ARE LOOKING FOR DOES NOT EXIST, YOU MAY HAVE ENTERED THE WRONG ADDRESS OR WE MAY HAVE MOVED THE PAGE.</p></div>

            <div className={styles.goMain}>
                <Link to="/">BACK TO EXPLORE</Link>
            </div>

    </div>);
}