import { push } from 'connected-react-router';
import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { compose } from 'redux';

import A from '../../components/A';

export function AdminLandingPage({
  navToWalk,
}) {
  return (
    <div>
      <Helmet>
        <title>Admin</title>
        <meta name="description" content="Admin" />
      </Helmet>
      <h1>Admin</h1>
      <A onClick={navToWalk}>Walk</A>
    </div>
  );
}

const mapDispatchToProps = dispatch => ({
  navToWalk: () => dispatch(push('/admin/walk')),
});

const withConnect = connect(null, mapDispatchToProps);

export default compose(
  withConnect,
)(AdminLandingPage);
