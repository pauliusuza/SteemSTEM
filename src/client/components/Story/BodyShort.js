import React from 'react';
import PropTypes from 'prop-types';
import ellipsis from 'text-ellipsis';
import striptags from 'striptags';
import MarkdownIt from 'markdown-it';

const markdownIt = new MarkdownIt({ html: true });

function decodeEntities(body) {
  return body.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

const BodyShort = props => {
  let body = striptags(markdownIt.render(striptags(decodeEntities(props.body))));
  body = body.replace(/(?:https?|ftp):\/\/[\S]+/g, '');

  // If body consists of whitespace characters only skip it.
  if (!body.replace(/\s/g, '').length) {
    return null;
  }

  /* eslint-disable react/no-danger */
  return (
    <div className={"bodyShort"}>
      <h2>{props.title}</h2>
      <div
        className={props.className}
        dangerouslySetInnerHTML={{ __html: ellipsis(body, props.length, { ellipsis: '…' }) }}
      />
    </div>
  );
  /* eslint-enable react/no-danger */
};

BodyShort.propTypes = {
  className: PropTypes.string,
  body: PropTypes.string,
  length: PropTypes.number,
  title: PropTypes.string,
};

BodyShort.defaultProps = {
  className: '',
  body: '',
  title: '',
  length: 100,
};

export default BodyShort;
