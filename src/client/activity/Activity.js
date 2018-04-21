import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { injectIntl } from 'react-intl';
import Affix from '../components/Utils/Affix';
import UserActivity from './UserActivity';
import RightSidebar from '../app/Sidebar/RightSidebar';
import requiresLogin from '../auth/requiresLogin';

const Activity = ({ intl }) => (
  <div className="shifted">
    <Helmet>
      <title>{intl.formatMessage({ id: 'activity', defaultMessage: 'Activity' })} - Busy</title>
    </Helmet>
    <div className="feed-layout container">
      <div className="center">
        <UserActivity isCurrentUser />
      </div>
      <Affix className="rightSidebar" stickPosition={77}>
        <RightSidebar />
      </Affix>
    </div>
  </div>
);

Activity.propTypes = {
  intl: PropTypes.shape().isRequired,
};

export default requiresLogin(injectIntl(Activity));
