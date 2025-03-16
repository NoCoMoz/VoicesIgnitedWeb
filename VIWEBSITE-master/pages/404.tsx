import React from 'react';
import Link from 'next/link';
import styles from '../src/styles/pages/404.module.scss';

/**
 * Custom 404 page component with proper error handling and user experience
 */
export default function Custom404() {
  return (
    <div className={styles.errorContainer}>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, we couldn't find the page you're looking for.</p>
      <Link href="/" className={styles.homeLink}>
        Return to Home
      </Link>
    </div>
  );
}
