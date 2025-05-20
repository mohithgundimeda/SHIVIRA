    /* 
    Where would you like to travel? *,
    Your Name,*
    Your Contact Number, *
    Your Email Address, *
    When would you like to travel?,
    How many days would you like to stay?,
    Number of Adults, min=1
    Number of Children (2-12 years), def=0
    Number of Infants (0-2 years), def = 0
    Which city will you be departing from?
    What’s your preferred budget for this trip? (Optional)
    Tell us about your trip or any special requests (Optional)
    By submitting this form, you agree to allow us to contact you via phone or email.  
    */
import React from "react";
import dayjs from 'dayjs';
import styles from '../Styles/Form.module.css';
import Input from '@mui/material/Input';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useIsMobile } from './useIsMobile';

export default function Form({ destination = '' }) {
  const isMobile = useIsMobile();

  return (
    <div className={styles.container}>
      <div className={styles.topContainer}>
        <div className={styles.logoContainer}>
          <img
            src="/static/logo4.png"
            alt="shivira logo"
            loading="lazy"
            className={styles.logo}
          />
        </div>
      </div>

      <div className={styles.bottomContainer}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div>
            <p>Where would you like to travel? *</p>
            <Input required fullWidth defaultValue={destination} />
          </div>

          <div>
            <p>Your Name *</p>
            <Input required fullWidth />
          </div>

          <div>
            <p>Your Contact Number *</p>
            <Input required type="number" fullWidth />
          </div>

          <div>
            <p>Your Email Address *</p>
            <Input required type="email" fullWidth />
          </div>

          <div>
            <p>When would you like to travel?</p>
            {isMobile ? (
              <MobileDatePicker defaultValue={dayjs('2022-04-17')} />
            ) : (
              <DesktopDatePicker defaultValue={dayjs('2022-04-17')} />
            )}
          </div>
        </LocalizationProvider>
      </div>
    </div>
  );
}