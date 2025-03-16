import React, { useEffect, useState } from 'react';
import '@/styles/components/mailingList.styles.scss';

/**
 * MailingList component for Voices Ignited
 * Integrates with Mautic form system for email collection
 */
const MailingList = () => {
  const [isClient, setIsClient] = useState(false);

  // Fix for hydration issues - only render dynamic content after client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Initialize Mautic form script only on the client side
    if (isClient) {
      if (typeof (window as any).MauticSDKLoaded === 'undefined') {
        (window as any).MauticSDKLoaded = true;
        const head = document.getElementsByTagName('head')[0];
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'http://134.199.141.110/media/js/mautic-form.js?v9588c9c1';
        script.onload = function() {
          if ((window as any).MauticSDK) {
            (window as any).MauticSDK.onLoad();
          }
        };
        head.appendChild(script);
        (window as any).MauticDomain = 'http://134.199.141.110';
        (window as any).MauticLang = {
          'submittingMessage': "Please wait..."
        };
      } else if (typeof (window as any).MauticSDK !== 'undefined') {
        (window as any).MauticSDK.onLoad();
      }
    }
  }, [isClient]);

  return (
    <div className="mailing-list-container">
      <h2 className="mailing-list-title">Stay Connected</h2>
      <p className="mailing-list-description">Join our mailing list to receive updates on events, campaigns, and ways to get involved with Voices Ignited.</p>
      
      {/* Only render the form after client-side hydration */}
      {isClient ? (
        <div id="mauticform_wrapper_emaillistfromwebsite" className="mauticform_wrapper">
          <form 
            autoComplete="false" 
            role="form" 
            method="post" 
            action="http://134.199.141.110/form/submit?formId=1" 
            id="mauticform_emaillistfromwebsite" 
            data-mautic-form="emaillistfromwebsite" 
            encType="multipart/form-data"
          >
            <div className="mauticform-error" id="mauticform_emaillistfromwebsite_error"></div>
            <div className="mauticform-message" id="mauticform_emaillistfromwebsite_message"></div>
            <div className="mauticform-innerform">
              <div className="mauticform-page-wrapper mauticform-page-1" data-mautic-form-page="1">
                <div id="mauticform_emaillistfromwebsite_email" className="mauticform-row mauticform-email mauticform-field-1">
                  <label id="mauticform_label_emaillistfromwebsite_email" htmlFor="mauticform_input_emaillistfromwebsite_email" className="mauticform-label">Email</label>
                  <span className="mauticform-helpmessage">Email</span>
                  <input id="mauticform_input_emaillistfromwebsite_email" name="mauticform[email]" value="" className="mauticform-input" type="email" placeholder="Your email address" />
                  <span className="mauticform-errormsg" style={{ display: 'none' }}></span>
                </div>

                <div id="mauticform_emaillistfromwebsite_submit" className="mauticform-row mauticform-button-wrapper mauticform-field-2">
                  <button type="submit" name="mauticform[submit]" id="mauticform_input_emaillistfromwebsite_submit" value="" className="mauticform-button btn btn-default">Subscribe</button>
                </div>
              </div>
            </div>

            <input type="hidden" name="mauticform[formId]" id="mauticform_emaillistfromwebsite_id" value="1" />
            <input type="hidden" name="mauticform[return]" id="mauticform_emaillistfromwebsite_return" value="" />
            <input type="hidden" name="mauticform[formName]" id="mauticform_emaillistfromwebsite_name" value="emaillistfromwebsite" />
          </form>
        </div>
      ) : (
        <div className="mauticform_wrapper loading-placeholder">
          <div className="form-placeholder">
            <div className="input-placeholder"></div>
            <div className="button-placeholder"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MailingList;
