import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import VisibilitySensor from 'react-visibility-sensor';
import formatter from '../helpers/steemitFormatter';
import { getCryptoDetails } from '../helpers/cryptosHelper';
import { isBannedPost } from '../helpers/postHelpers';
import {
  getPostContent,
  getIsPostEdited,
  getIsPostFetching,
  getIsPostLoaded,
  getIsPostFailed,
  getUser,
  getIsAuthFetching,
} from '../reducers';
import { getContent } from './postActions';
import { getAccount } from '../user/usersActions';
import Error404 from '../statics/Error404';
import Comments from '../comments/Comments';
import Loading from '../components/Icon/Loading';
import PostContent from './PostContent';
import Affix from '../components/Utils/Affix';
import HiddenPostMessage from './HiddenPostMessage';
import PostRecommendation from '../components/Sidebar/PostRecommendation';
import CryptoTrendingCharts from '../components/Sidebar/CryptoTrendingCharts';
import ScrollToTopOnMount from '../components/Utils/ScrollToTopOnMount';

@connect(
  (state, ownProps) => ({
    edited: getIsPostEdited(state, ownProps.match.params.permlink),
    content: getPostContent(state, ownProps.match.params.author, ownProps.match.params.permlink),
    isAuthFetching: getIsAuthFetching(state),
    fetching: getIsPostFetching(
      state,
      ownProps.match.params.author,
      ownProps.match.params.permlink,
    ),
    loaded: getIsPostLoaded(state, ownProps.match.params.author, ownProps.match.params.permlink),
    failed: getIsPostFailed(state, ownProps.match.params.author, ownProps.match.params.permlink),
    user: getUser(state, ownProps.match.params.author),
  }),
  { getContent, getAccount },
)
export default class Post extends React.Component {
  static propTypes = {
    isAuthFetching: PropTypes.bool.isRequired,
    match: PropTypes.shape().isRequired,
    user: PropTypes.shape(),
    edited: PropTypes.bool,
    content: PropTypes.shape(),
    fetching: PropTypes.bool,
    loaded: PropTypes.bool,
    failed: PropTypes.bool,
    getContent: PropTypes.func,
    getAccount: PropTypes.func,
  };

  static defaultProps = {
    user: {},
    edited: false,
    content: undefined,
    fetching: false,
    loaded: false,
    failed: false,
    getContent: () => {},
    getAccount: () => {},
  };

  static fetchData(store, match) {
    const { author, permlink } = match.params;
    return Promise.all([
      store.dispatch(getAccount(author)),
      store.dispatch(getContent(author, permlink)),
    ]);
  }

  state = {
    commentsVisible: false,
    showHiddenPost: false,
  };

  componentDidMount() {
    const { match, edited, fetching, loaded, failed, content } = this.props;
    const { author, permlink } = match.params;

    const shouldUpdate = (!loaded && !failed) || edited;
    if (shouldUpdate && !fetching) {
      this.props.getContent(author, permlink);
      this.props.getAccount(author);
    }

    if (!!content && match.params.category && typeof window !== 'undefined') {
      window.history.replaceState(
        {},
        '',
        `/@${content.author}/${content.permlink}${window.location.hash}`,
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    const { author, permlink } = nextProps.match.params;
    const { author: prevAuthor, permlink: prevPermlink } = this.props.match.params;

    const shouldUpdate = author !== prevAuthor || permlink !== prevPermlink;
    if (shouldUpdate && !nextProps.fetching) {
      this.setState({ commentsVisible: false }, () => {
        this.props.getContent(author, permlink);
        this.props.getAccount(author);
      });
    }
  }

  componentWillUnmount() {
    if (process.env.IS_BROWSER) {
      global.document.title = 'Busy';
    }
  }

  handleCommentsVisibility = visible => {
    if (visible) {
      this.setState({
        commentsVisible: true,
      });
    }
  };

  handleShowPost = () => {
    this.setState({
      showHiddenPost: true,
    });
  };

  render() {
    const { content, fetching, loaded, failed, isAuthFetching, user } = this.props;

    if (failed) return <Error404 />;
    if (fetching || !content) return <Loading />;

    const { showHiddenPost } = this.state;
    const reputation = loaded ? formatter.reputation(content.author_reputation) : 0;
    const showPost = reputation >= 0 || showHiddenPost;

    const signature = _.get(user, 'json_metadata.profile.signature', null);

    return (
      <div className="main-panel">
        <ScrollToTopOnMount />
        <div className="shifted">
          <div className="post-layout container">
            {showPost ? (
              <div className="center" style={{ paddingBottom: '24px' }}>
                <PostContent content={content} signature={signature} />
                <VisibilitySensor onChange={this.handleCommentsVisibility} />
                {!isBannedPost(content) && (
                  <div id="comments">
                    <Comments show={this.state.commentsVisible} post={content} />
                  </div>
                )}
              </div>
            ) : (
              <HiddenPostMessage onClick={this.handleShowPost} />
            )}
            <Affix className="rightSidebar" stickPosition={77}>
              <PostRecommendation isAuthFetching={isAuthFetching} />
            </Affix>
          </div>
        </div>
      </div>
    );
  }
}
