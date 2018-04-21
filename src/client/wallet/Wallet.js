import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { injectIntl } from 'react-intl';
import Affix from '../components/Utils/Affix';
import LeftSidebar from '../app/Sidebar/LeftSidebar';
import WalletSidebar from '../components/Sidebar/WalletSidebar';
import UserWallet from '../user/UserWallet';
import requiresLogin from '../auth/requiresLogin';

const Wallet = ({ intl }) => (
  <div className="shifted">
    <Helmet>
      <title>{intl.formatMessage({ id: 'wallet', defaultMessage: 'Wallet' })} - Busy</title>
    </Helmet>
    <div className="feed-layout container">
      <div className="center">
        <UserWallet isCurrentUser />
      </div>
      <Affix className="rightSidebar" stickPosition={77}>
        <WalletSidebar isCurrentUser />
      </Affix>
    </div>
  </div>
);

Wallet.propTypes = {
  intl: PropTypes.shape().isRequired,
};

export default requiresLogin(injectIntl(Wallet));
