import React, { Component } from 'react';
import { Alert, Notify, BlockLoading, Sweetalert } from 'zent';
import EventEmitter from 'eventemitter3';
import ajax from 'zan-pc-ajax';
import formatDate from 'zan-utils/date/formatDate';
import get from 'lodash/get';

import { Form, createForm } from '@youzan/formulr/zent';
import AppAction from 'components/app-action';