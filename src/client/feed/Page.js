import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';

import { getFeedContent } from './feedActions';
import { getIsLoaded, getIsAuthenticated } from '../reducers';
import SubFeed from './SubFeed';
import FeedMenu from './FeedMenu';
import HeroBannerContainer from './HeroBannerContainer';
import RightSidebar from '../app/Sidebar/RightSidebar';
import TopicSelector from '../components/TopicSelector';
import TrendingTagsMenu from '../components/TrendingTagsMenu';
import Affix from '../components/Utils/Affix';
import ScrollToTop from '../components/Utils/ScrollToTop';
import ScrollToTopOnMount from '../components/Utils/ScrollToTopOnMount';
import QuickPostEditor from '../components/QuickPostEditor/QuickPostEditor';
import './Page.less';

@connect(state => ({
  authenticated: getIsAuthenticated(state),
  loaded: getIsLoaded(state),
}))
class Page extends React.Component {
  static propTypes = {
    authenticated: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    history: PropTypes.shape().isRequired,
    location: PropTypes.shape().isRequired,
    match: PropTypes.shape().isRequired,
  };

  static fetchData({ store, match }) {
    const { sortBy, category } = match.params;
    return store.dispatch(getFeedContent({ sortBy, category, limit: 10 }));
  }

  handleSortChange = key => {
    const { category } = this.props.match.params;
    if (category) {
      this.props.history.push(`/${key}/${category}`);
    } else {
      this.props.history.push(`/${key}`);
    }
  };

  handleTopicClose = () => this.props.history.push('/trending');

  render() {
    const { authenticated, loaded, location, match } = this.props;
    const { category, sortBy } = match.params;

    const shouldDisplaySelector = location.pathname !== '/' || (!authenticated && loaded);
    const displayTopicSelector = location.pathname === '/trending';
    const shouldDisplayFeedMenu = (
      location.pathname === '/' ||
      location.pathname === '/trending' ||
      location.pathname === '/created' ||
      location.pathname === '/active' ||
      location.pathname === '/hot'
    );

    const robots = location.pathname === '/' ? 'index,follow' : 'noindex,follow';

    return (
      <div>
        <Helmet>
          <title>SteemSTEM</title>
          <meta name="robots" content={robots} />
        </Helmet>
        <ScrollToTop />
        <ScrollToTopOnMount />
        <HeroBannerContainer />
        <div className="shifted">
          <div className="feed-layout container">
            <div className="center">
              <div className="feed-utils">
              {shouldDisplaySelector && (
                <TopicSelector
                  isSingle={false}
                  sort={sortBy}
                  topics={category ? [category] : []}
                  onSortChange={this.handleSortChange}
                  onTopicClose={this.handleTopicClose}
                  style={{flex: 1}}
                />
              )}
              {shouldDisplayFeedMenu && <FeedMenu category={category} sortBy={sortBy || 'trending'} />
              /*<QuickPostEditor />*/}
              </div>
              <SubFeed />
            </div>
            <Affix className="rightSidebar" stickPosition={77}>
              <RightSidebar />
            </Affix>
          </div>
        </div>
      </div>
    );
  }
}

export default Page;
