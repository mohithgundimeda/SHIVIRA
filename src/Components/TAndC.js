import React,{useMemo} from "react";
import styles from '../Styles/Itinerary.module.css';

export default function TAndC(){

    const data = useMemo(()=>[
        'Entrance fee, parking and guide charges are not included in the packages.',
        'Booking rates are subject to change without prior notice.',
        'In case of unavailability in the listed hotels, arrangement for an alternate accommodation will be made in a hotel of similar standard.',
        'In case your package needs to be cancelled due to any natural calamity, weather conditions etc. shivira shall strive to give you the maximum possible refund.',
        'Shivira reserves the right to modify the itinerary at any point, due to reasons including but not limited to: strikes, fairs, festivals, traffic problems, closure of entry restrictions at a place of visit, etc. While we will do our best to make suitable alternate arrangements, we would not be held liable for any refunds/compensation claims arising out of this.',
        'Certain hotels may ask for a security deposit during check-in, which is refundable at check-out subject to the hotel policy.',
        'The booking price does not include: Expenses of personal nature, such as laundry, telephone calls, room service, alcoholic beverages, mini bar charges, tips, portage, camera fees etc.',
        'Cost of deviation and cost of extension of the validity on your ticket is not included.',

    ],[]);

    return(
        <div className={styles.tacContainer}>
            <ul className={styles.list}>
                {data.map((text, index)=>{
                    return <li key={index} className={styles.listItem}>{text}</li>
                })}
            </ul>
        </div>
    )
}