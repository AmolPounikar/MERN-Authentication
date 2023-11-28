import { useFormik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';
import avatar from '../assets/profile.png';
import { usernameValidate } from '../helper/validate.js';
import { useAuthStore } from '../store/store.js';
import styles from '../styles/Username.module.css';
export default function Username() {

  const navigate = useNavigate();
  const loadingBarRef = useRef(null);
  const setUsername = useAuthStore(state => state.setUsername);
  const [loadingBarColor, setLoadingBarColor] = useState('#FF0000');
  const formik = useFormik({
    initialValues: {
      username: '',
    },
    validate: usernameValidate,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values, e) => {
      setUsername(values.username);
      navigate('/password');
      e.preventDefault();
    },
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loadingBarRef.current) {
        loadingBarRef.current.continuousStart();
        setLoadingBarColor('#008000');
      }
    }, 4000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="container mx-auto">
      <Toaster position="top-center" reverseOrder={false}></Toaster>
      {loadingBarColor === '#008000' ? (
        <LoadingBar color="#00FF00" />
      ) : (
        <LoadingBar color="#FF0000" />
      )}
      <div className="flex justify-center items-center h-screen">
        <div >
          <div className="title flex flex-col items-center">
            <h4 className="text-5xl font-bold text-slate-500 ">Hello Again!</h4>
            <span className="py-4 text-xl w-2/3 text-center text-gray-500">
              Explore More by connecting with us.
            </span>
          </div>

          <form className="py-1" onSubmit={formik.handleSubmit}>
            <div className="profile flex justify-center py-4">
              <img src={avatar} className={styles.profile_img} alt="avatar" />
            </div>

            <div className="textbox flex flex-col items-center gap-6">
              <input
                {...formik.getFieldProps('username')}
                className={styles.textbox}
                type="text"
                placeholder="Username"
              />
              <button className={styles.btn} type="submit">
                Let's Go
              </button>
            </div>

            <div className="text-center py-4">
              <span className="text-gray-500">
                Not a Member{' '}
                <Link className="text-red-500" to="/register">
                  Register Now
                </Link>
              </span>
            </div>
          </form>

          {/* Conditional rendering of the LoadingBar */}

        </div>
      </div>
    </div>
  )
}
