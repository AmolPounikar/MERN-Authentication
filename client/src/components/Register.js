import { useFormik } from 'formik';
import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';
import avatar from '../assets/profile.png';
import convertToBase64 from '../helper/convert.js';
import { registerUser } from '../helper/helper.js';
import { registerValidation } from '../helper/validate.js';

import styles from '../styles/Username.module.css';

export default function Register() {

  const navigate = useNavigate()
  const [file, setFile] = useState()
  const [loading, setLoading] = useState(false)
  const [loadingBarColor, setLoadingBarColor] = useState('#00ff00')

  const formik = useFormik({
    initialValues: {
      email: '',
      username: '',
      password: ''
    },
    validate: registerValidation,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async values => {
      setLoading(true)
      values = await Object.assign(values, { profile: file || '' })
      let registerPromise = registerUser(values)
      toast.promise(registerPromise, {
        loading: 'Creating...',
        success: <b>Register Successfully...!</b>,
        error: <b>Could not Register.</b>
      });

      try {
        await registerPromise;
        setLoadingBarColor('#00ff00');
        navigate('/');
      } catch (error) {
        setLoadingBarColor('#f11946');
      } finally {
        setLoading(false);
      }
    }
  })

  const onUpload = async e => {
    const base64 = await convertToBase64(e.target.files[0]);
    setFile(base64);
  }

  return (
    <div className="container mx-auto">

      <Toaster position='top-center' reverseOrder={false}></Toaster>
      {loading && <LoadingBar color={loadingBarColor} progress={100} height={3} />}
      <div className='flex justify-center items-center h-screen'>
        <div style={{ width: '100%', maxWidth: '650px', paddingTop: '0.5em' }}>

          <div className="title flex flex-col items-center">
            <h4 className='text-5xl font-bold  text-slate-500'>Register</h4>
            <span className='py-4 text-xl w-2/3 text-center text-gray-500'>
              Happy to join you!
            </span>
          </div>

          <form className='py-1' onSubmit={formik.handleSubmit}>
            <div className='profile flex justify-center py-4'>
              <label htmlFor="profile">
                <img src={file || avatar} className={styles.profile_img} alt="avatar" />
              </label>

              <input onChange={onUpload} type="file" id='profile' name='profile' />
            </div>

            <div className="textbox flex flex-col items-center gap-6">
              <input {...formik.getFieldProps('email')} className={styles.textbox} type="text" placeholder='Email*' />
              <input {...formik.getFieldProps('username')} className={styles.textbox} type="text" placeholder='Username*' />
              <input {...formik.getFieldProps('password')} className={styles.textbox} type="text" placeholder='Password*' />
              <button className={styles.btn} type='submit'>Register</button>
            </div>

            <div className="text-center py-4">
              <span className='text-gray-500'>Already Register? <Link className='text-red-500' to="/">Login Now</Link></span>
            </div>

          </form>

        </div>
      </div>
    </div>
  )
}

