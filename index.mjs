import React, { createContext, useState, useEffect, useCallback, useRef, useContext, useMemo } from 'react';
import useComponentSize from '@rehooks/component-size';
import classcat from 'classcat';
import addDays from 'date-fns/add_days';
import addHours from 'date-fns/add_hours';
import format from 'date-fns/format';
import isDateEqual from 'date-fns/is_equal';
import startOfDay from 'date-fns/start_of_day';
import invariant from 'invariant';
import isEqual from 'lodash/isEqual';
import times from 'lodash/times';
import scrollIntoView from 'scroll-into-view-if-needed';
import en from 'date-fns/locale/en';
import { fromEvent, of, merge } from 'rxjs';
import { mergeMap, delay, takeUntil, filter, map, tap, startWith } from 'rxjs/operators';
import Mousetrap from 'mousetrap';
import clamp from 'lodash/clamp';
import floor from 'lodash/floor';
import round from 'lodash/round';
import addMinutes from 'date-fns/add_minutes';
import compareAsc from 'date-fns/compare_asc';
import endOfDay from 'date-fns/end_of_day';
import isBefore from 'date-fns/is_before';
import min from 'date-fns/min';
import range from 'lodash/range';
import differenceInDays from 'date-fns/difference_in_days';
import differenceInMinutes from 'date-fns/difference_in_minutes';
import setDay from 'date-fns/set_day';
import _mergeRanges from 'merge-ranges';
import getMinutes from 'date-fns/get_minutes';
import Resizable from 're-resizable';
import Draggable from 'react-draggable';
import VisuallyHidden from '@reach/visually-hidden';
import isSameDay from 'date-fns/is_same_day';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toArray(arr) {
  return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var DefaultEventRootComponent = /*#__PURE__*/React.memo( /*#__PURE__*/
React.forwardRef(function DefaultEventRootComponent(_ref,









ref)
{var isActive = _ref.isActive,handleDelete = _ref.handleDelete,cellIndex = _ref.cellIndex,rangeIndex = _ref.rangeIndex,classes = _ref.classes,disabled = _ref.disabled,props = _objectWithoutProperties(_ref, ["isActive", "handleDelete", "cellIndex", "rangeIndex", "classes", "disabled"]);
  return /*#__PURE__*/React.createElement("div", _extends({ ref: ref, "aria-disabled": disabled }, props));
}));

var SchedulerContext = /*#__PURE__*/createContext({ locale: en });

var createPageMapCoordsToContainer = function createPageMapCoordsToContainer(container) {
  return function (event) {
    var clientX;
    var clientY;
    var pageX;
    var pageY;

    if ('changedTouches' in event) {var _event$changedTouches =
      event.changedTouches[0];clientX = _event$changedTouches.clientX;clientY = _event$changedTouches.clientY;pageX = _event$changedTouches.pageX;pageY = _event$changedTouches.pageY;
    } else {
      clientX = event.clientX;clientY = event.clientY;pageX = event.pageX;pageY = event.pageY;
    }var _container$getBoundin =
    container.getBoundingClientRect(),top = _container$getBoundin.top,left = _container$getBoundin.left;

    return {
      clientX: clientX,
      clientY: clientY,
      pageX: pageX,
      pageY: pageY,
      top: top,
      left: left,
      x: clientX - left,
      y: clientY - top };

  };
};

var prevent = /*#__PURE__*/tap(function (e) {
  e.preventDefault();
  e.stopPropagation();
});

function useClickAndDrag(
ref,
isDisabled)
{var _useState =
  useState({
    transform: 'translate(0, 0)',
    width: 0,
    height: 0 }),_useState2 = _slicedToArray(_useState, 2),style = _useState2[0],setStyle = _useState2[1];var _useState3 =

  useState(null),_useState4 = _slicedToArray(_useState3, 2),box = _useState4[0],setBox = _useState4[1];var _useState5 =
  useState(false),_useState6 = _slicedToArray(_useState5, 2),isDragging = _useState6[0],setIsDragging = _useState6[1];var _useState7 =
  useState(false),_useState8 = _slicedToArray(_useState7, 2),hasFinishedDragging = _useState8[0],setHasFinishedDragging = _useState8[1];
  var container = ref.current;

  useEffect(function () {
    if (!container || isDisabled) {
      return;
    }

    var mapCoordsToContainer = createPageMapCoordsToContainer(container);

    var touchMove$ = fromEvent(window, 'touchmove', {
      passive: false }).
    pipe(prevent);

    var touchEnd$ = fromEvent(window, 'touchend', {
      passive: true });


    var touchStart$ = fromEvent(container, 'touchstart', {
      passive: false });


    var touchStartWithDelay$ = touchStart$.pipe(
    mergeMap(function (start) {return (
        of(start).pipe(
        delay(300),
        takeUntil(touchMove$),
        prevent));}));




    var mouseDown$ = fromEvent(container, 'mousedown', {
      passive: true }).
    pipe(filter(function (event) {return event.which === 1;}));

    var mouseMove$ = fromEvent(window, 'mousemove', {
      passive: true });


    var mouseUp$ = fromEvent(window, 'mouseup', {
      passive: true });


    var dragStart$ = merge(mouseDown$, touchStartWithDelay$).pipe(
    map(mapCoordsToContainer));


    var dragEnd$ = merge(mouseUp$, touchEnd$).pipe(
    map(mapCoordsToContainer),
    tap(function () {
      setIsDragging(false);
      setHasFinishedDragging(true);
    }));


    var move$ = merge(mouseMove$, touchMove$).pipe(map(mapCoordsToContainer));

    var box$ = dragStart$.pipe(
    tap(function () {
      setIsDragging(true);
      setHasFinishedDragging(false);
    }),
    mergeMap(function (down) {
      return move$.pipe(
      startWith(down),
      map(
      function (move) {
        var startX = Math.max(down.x, 0);
        var startY = Math.max(down.y, 0);
        var endX = Math.min(move.x, container.scrollWidth);
        var endY = Math.min(move.y, container.scrollHeight);
        var top = Math.min(startY, endY);
        var bottom = Math.max(startY, endY);
        var left = Math.min(startX, endX);
        var right = Math.max(startX, endX);

        return {
          startX: startX,
          startY: startY,
          endX: endX,
          endY: endY,
          top: top,
          bottom: bottom,
          left: left,
          right: right,
          width: right - left,
          height: bottom - top };

      }),

      takeUntil(dragEnd$));

    }),
    map(function (rect) {
      return rect.width === 0 && rect.height === 0 ? null : rect;
    }));


    var style$ = box$.pipe(
    map(function (rect) {
      if (rect !== null) {var
        width = rect.width,height = rect.height,left = rect.left,top = rect.top;
        return {
          transform: "translate(".concat(left, "px, ").concat(top, "px)"),
          width: width,
          height: height };

      }

      return { display: 'none' };
    }));


    var boxSubscriber = box$.subscribe(setBox);
    var styleSubscriber = style$.subscribe(setStyle);

    return function () {
      boxSubscriber.unsubscribe();
      styleSubscriber.unsubscribe();
    };
  }, [container, isDisabled]);

  var cancel = useCallback(function () {
    setIsDragging(false);
    setHasFinishedDragging(false);
    setBox(null);
  }, []);

  return { style: style, box: box, isDragging: isDragging, cancel: cancel, hasFinishedDragging: hasFinishedDragging };
}

/**
 * Use mousetrap hook
 *
 * @param handlerKey - A key, key combo or array of combos according to Mousetrap documentation.
 * @param  handlerCallback - A function that is triggered on key combo catch.
 */
function useMousetrap(
handlerKey,
handlerCallback,
elementOrElementRef)
{
  var actionRef = useRef(null);
  actionRef.current = handlerCallback;
  var element =
  'current' in elementOrElementRef ? elementOrElementRef.current : document;

  useEffect(function () {
    var instance = new Mousetrap(element);

    instance.bind(handlerKey, function (e, combo) {
      typeof actionRef.current === 'function' && actionRef.current(e, combo);
    });

    return function () {
      instance.unbind(handlerKey);
    };
  }, [handlerKey, element]);
}

var getSpan = function getSpan(x1, x2) {return 1 + Math.abs(x2 - x1);};

var createGrid = function createGrid(_ref)









{var totalHeight = _ref.totalHeight,totalWidth = _ref.totalWidth,numVerticalCells = _ref.numVerticalCells,numHorizontalCells = _ref.numHorizontalCells;
  var cellHeight = totalHeight / numVerticalCells;
  var cellWidth = totalWidth / numHorizontalCells;

  return {
    totalHeight: totalHeight,
    totalWidth: totalWidth,
    numVerticalCells: numVerticalCells,
    numHorizontalCells: numHorizontalCells,
    cellWidth: cellWidth,
    cellHeight: cellHeight,

    getRectFromCell: function getRectFromCell(data) {var
      endX = data.endX,startX = data.startX,endY = data.endY,startY = data.startY,spanX = data.spanX,spanY = data.spanY;
      var bottom = endY * this.cellHeight;
      var top = startY * this.cellHeight;
      var left = startX * this.cellWidth;
      var right = endX * this.cellWidth;
      var height = spanY * this.cellHeight;
      var width = spanX * this.cellWidth;

      return {
        bottom: bottom,
        top: top,
        left: left,
        right: right,
        height: height,
        width: width,

        // @TODO: check the math
        startX: startX * this.cellWidth,
        endX: endX * this.cellWidth,
        startY: startY * this.cellHeight,
        endY: endY * this.cellHeight };

    },

    getCellFromRect: function getCellFromRect(data) {
      var startX = clamp(
      floor(data.left / this.cellWidth),
      0,
      numHorizontalCells - 1);

      var startY = clamp(
      round(data.top / this.cellHeight),
      0,
      numVerticalCells - 1);

      var endX = clamp(
      floor(data.right / this.cellWidth),
      0,
      numHorizontalCells - 1);

      var endY = clamp(
      round(data.bottom / this.cellHeight),
      0,
      numVerticalCells - 1);

      var spanX = clamp(getSpan(startX, endX), 1, numHorizontalCells);
      var spanY = clamp(getSpan(startY, endY), 1, numVerticalCells);

      return {
        spanX: spanX,
        spanY: spanY,
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY };

    } };

};

var cellToDate = function cellToDate(_ref) {var
  startX = _ref.startX,
  startY = _ref.startY,
  toMin = _ref.toMin,
  originDate = _ref.originDate;return (






    addMinutes(addDays(originDate, startX), toMin(startY)));};

var createMapCellInfoToRecurringTimeRange = function createMapCellInfoToRecurringTimeRange(_ref) {var
  toMin = _ref.fromY,
  toDay = _ref.fromX,
  originDate = _ref.originDate;return (
    function (_ref2) {var startX = _ref2.startX,startY = _ref2.startY,endX = _ref2.endX,spanY = _ref2.spanY;
      var result = range(startX, endX + 1).
      map(function (i) {
        var startDate = cellToDate({
          startX: i,
          startY: startY,
          toMin: toMin,
          toDay: toDay,
          originDate: originDate });

        var endDate = min(
        addMinutes(startDate, toMin(spanY)),
        endOfDay(startDate));


        var range = isBefore(startDate, endDate) ?
        [startDate, endDate] :
        [endDate, startDate];

        return range;
      }).
      sort(function (range1, range2) {return compareAsc(range1[0], range2[0]);});

      return result;
    });};

var createMapDateRangeToCells = function createMapDateRangeToCells(_ref) {var _ref$toX = _ref.
  toX,toX = _ref$toX === void 0 ? function (x) {return x;} : _ref$toX,
  toY = _ref.toY,
  numVerticalCells = _ref.numVerticalCells,
  originDate = _ref.originDate;return (






    function (_ref2) {var _ref3 = _slicedToArray(_ref2, 2),start = _ref3[0],end = _ref3[1];
      var originOfThisDay = startOfDay(start);
      var _startX = toX(differenceInDays(start, originDate));
      var _startY = toY(differenceInMinutes(start, originOfThisDay));
      var _endX = toX(differenceInDays(end, originDate));
      var _endY = toY(differenceInMinutes(end, startOfDay(end))) - 1;

      var cells = range(_startX, _endX + 1).map(function (i) {
        var startX = i;
        var endX = i;
        var atStart = i === _startX;
        var atEnd = i === _endX;
        var startY = !atStart ? 0 : _startY;
        var endY = !atEnd ? numVerticalCells - 1 : _endY;
        var spanX = getSpan(startX, endX);
        var spanY = getSpan(startY, endY);

        return {
          startX: startX,
          startY: startY,
          endX: endX,
          endY: endY,
          spanX: spanX,
          spanY: spanY };

      });

      if (isDateEqual(end, startOfDay(end))) {
        cells.pop();
      }

      return cells;
    });};

function getEarliestTimeRange(
ranges)
{
  return _toConsumableArray(ranges).sort(function (_ref, _ref2) {var _ref3 = _slicedToArray(_ref, 1),startA = _ref3[0];var _ref4 = _slicedToArray(_ref2, 1),startB = _ref4[0];return (
      compareAsc(setDay(startA, 0), setDay(startB, 0)));})[
  0];
}

function mergeRanges(event) {
  return _mergeRanges(
  _toConsumableArray(event).map(function (d) {return d.map(function (c) {return new Date(c);});}));

}

function mergeEvents(
event1,
event2)
{
  if (event2 === null) {
    return event1;
  }

  return mergeRanges([].concat(_toConsumableArray(event1), _toConsumableArray(event2))).sort(function (range1, range2) {return (
      compareAsc(range1[0], range2[0]));});

}

var Cell = /*#__PURE__*/React.memo(function Cell(_ref)











{var timeIndex = _ref.timeIndex,children = _ref.children,classes = _ref.classes,getDateRangeForVisualGrid = _ref.getDateRangeForVisualGrid,onClick = _ref.onClick;var _getDateRangeForVisua =
  getDateRangeForVisualGrid({
    startX: 0,
    startY: timeIndex,
    endX: 0,
    endY: timeIndex + 1,
    spanX: 1,
    spanY: 1 }),_getDateRangeForVisua2 = _slicedToArray(_getDateRangeForVisua, 1),_getDateRangeForVisua3 = _slicedToArray(_getDateRangeForVisua2[0], 1),start = _getDateRangeForVisua3[0];


  var isHourStart = getMinutes(start) === 0;

  return /*#__PURE__*/(
    React.createElement("div", {
      role: "button",
      onClick: onClick,
      className: classcat([
      classes.cell, _defineProperty({},
      classes['is-hour-start'], isHourStart)]) },


    children && children({ start: start, isHourStart: isHourStart })));


});

var formatTemplate = 'ddd h:mma';

var dropSame = function dropSame(
dates,
template)


{var takeSecond = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;var locale = arguments.length > 3 ? arguments[3] : undefined;var _dates$map =
  dates.map(function (date) {return format(date, template, { locale: locale });}),_dates$map2 = _slicedToArray(_dates$map, 2),first = _dates$map2[0],second = _dates$map2[1];
  if (first !== second) {
    return [first, second];
  }

  if (takeSecond) {
    return ['', second];
  }

  return [first, ''];
};

var formatHour = function formatHour(
date,
locale)
{
  if (getMinutes(date) === 0) {
    return format(date, 'h', { locale: locale });
  }

  return format(date, 'h:mm', { locale: locale });
};









var getFormattedComponentsForDateRange = function getFormattedComponentsForDateRange(_ref)





{var dateRange = _ref.dateRange,locale = _ref.locale,template = _ref.template,template2 = _ref.template2,_ref$includeDayIfSame = _ref.includeDayIfSame,includeDayIfSame = _ref$includeDayIfSame === void 0 ? true : _ref$includeDayIfSame;
  var start = dateRange[0];
  var end = dateRange[dateRange.length - 1];

  if (isSameDay(start, end) && !template) {var _dropSame =
    dropSame(dateRange, 'a', true, locale),_dropSame2 = _slicedToArray(_dropSame, 2),firstM = _dropSame2[0],secondM = _dropSame2[1];
    var day = includeDayIfSame ? "".concat(format(start, 'ddd', { locale: locale }), " ") : '';
    return ["".concat(
    day).concat(formatHour(start, {
      locale: locale })).concat(
    firstM), "".concat(
    formatHour(end, { locale: locale })).concat(secondM)];

  }

  var startDateStr = format(start, template || formatTemplate, { locale: locale });
  var endDateStr = format(end, template2 || formatTemplate, { locale: locale });

  return [startDateStr, endDateStr];
};

var getTextForDateRange = function getTextForDateRange(options) {
  return getFormattedComponentsForDateRange(options).join(' – ');
};

var EventContent = /*#__PURE__*/React.memo(function EventContent(_ref)






{var width = _ref.width,height = _ref.height,classes = _ref.classes,dateRange = _ref.dateRange,isStart = _ref.isStart,isEnd = _ref.isEnd;var _useContext =
  useContext(SchedulerContext),locale = _useContext.locale;var _getFormattedComponen =
  getFormattedComponentsForDateRange({
    dateRange: dateRange,
    locale: locale,
    includeDayIfSame: false }),_getFormattedComponen2 = _slicedToArray(_getFormattedComponen, 2),start = _getFormattedComponen2[0],end = _getFormattedComponen2[1];


  return /*#__PURE__*/(
    React.createElement("div", {
      style: { width: width - 20, height: height },
      className: classes['event-content'] }, /*#__PURE__*/

    React.createElement(VisuallyHidden, null,
    getTextForDateRange({ dateRange: dateRange, locale: locale })), /*#__PURE__*/

    React.createElement("span", { "aria-hidden": true, className: classes.start },
    isStart && start), /*#__PURE__*/

    React.createElement("span", { "aria-hidden": true, className: classes.end },
    isEnd && end)));



});

var RangeBox = /*#__PURE__*/React.memo(function RangeBox(_ref2)























{var _ref4;var classes = _ref2.classes,grid = _ref2.grid,rangeIndex = _ref2.rangeIndex,cellIndex = _ref2.cellIndex,cellArray = _ref2.cellArray,cell = _ref2.cell,className = _ref2.className,onChange = _ref2.onChange,cellInfoToDateRange = _ref2.cellInfoToDateRange,isResizable = _ref2.isResizable,moveAxis = _ref2.moveAxis,onActiveChange = _ref2.onActiveChange,onClick = _ref2.onClick,getIsActive = _ref2.getIsActive,_ref2$eventContentCom = _ref2.eventContentComponent,EventContentComponent = _ref2$eventContentCom === void 0 ? EventContent : _ref2$eventContentCom,_ref2$eventRootCompon = _ref2.eventRootComponent,EventRootComponent = _ref2$eventRootCompon === void 0 ? DefaultEventRootComponent : _ref2$eventRootCompon,disabled = _ref2.disabled;
  var ref = useRef(null);var _useState =
  useState(cell),_useState2 = _slicedToArray(_useState, 2),modifiedCell = _useState2[0],setModifiedCell = _useState2[1];
  var originalRect = useMemo(function () {return grid.getRectFromCell(cell);}, [cell, grid]);
  var rect = useMemo(function () {return grid.getRectFromCell(modifiedCell);}, [
  modifiedCell,
  grid]);


  useEffect(function () {
    setModifiedCell(cell);
  }, [cell]);

  var modifiedDateRange = useMemo(function () {return cellInfoToDateRange(modifiedCell);}, [
  cellInfoToDateRange,
  modifiedCell]);var


  top = rect.top,left = rect.left,width = rect.width,height = rect.height;

  var isStart = cellIndex === 0;
  var isEnd = cellIndex === cellArray.length - 1;

  var handleStop = useCallback(function () {
    if (!onChange || disabled) {
      return;
    }

    onChange(cellInfoToDateRange(modifiedCell), rangeIndex);
  }, [modifiedCell, rangeIndex, disabled, cellInfoToDateRange, onChange]);

  var isActive = useMemo(function () {return getIsActive({ cellIndex: cellIndex, rangeIndex: rangeIndex });}, [
  cellIndex,
  rangeIndex,
  getIsActive]);


  useMousetrap(
  'up',
  function () {
    if (!onChange || disabled || !isActive) {
      return;
    }

    if (moveAxis === 'none' || moveAxis === 'x') {
      return;
    }

    if (modifiedCell.startY === 0) {
      return;
    }

    var newCell = _objectSpread2(_objectSpread2({},
    modifiedCell), {}, {
      startY: modifiedCell.startY - 1,
      endY: modifiedCell.endY - 1 });


    onChange(cellInfoToDateRange(newCell), rangeIndex);
  },
  ref);


  useMousetrap(
  'shift+up',
  function () {
    if (!onChange || !isResizable || disabled || !isActive) {
      return;
    }

    if (
    modifiedCell.endY === modifiedCell.startY ||
    modifiedCell.spanY === 0)
    {
      return;
    }

    var newCell = _objectSpread2(_objectSpread2({},
    modifiedCell), {}, {
      endY: modifiedCell.endY - 1,
      spanY: modifiedCell.spanY - 1 });


    onChange(cellInfoToDateRange(newCell), rangeIndex);
  },
  ref);


  useMousetrap(
  'down',
  function () {
    if (!onChange || disabled || !isActive) {
      return;
    }

    if (moveAxis === 'none' || moveAxis === 'x') {
      return;
    }

    if (Math.round(modifiedCell.endY) >= grid.numVerticalCells - 1) {
      return;
    }

    var newCell = _objectSpread2(_objectSpread2({},
    modifiedCell), {}, {
      startY: modifiedCell.startY + 1,
      endY: modifiedCell.endY + 1 });


    onChange(cellInfoToDateRange(newCell), rangeIndex);
  },
  ref);


  useMousetrap(
  'shift+down',
  function () {
    if (!onChange || !isResizable || disabled || !isActive) {
      return;
    }

    if (moveAxis === 'none' || moveAxis === 'x') {
      return;
    }

    if (Math.round(modifiedCell.endY) >= grid.numVerticalCells - 1) {
      return;
    }

    var newCell = _objectSpread2(_objectSpread2({},
    modifiedCell), {}, {
      spanY: modifiedCell.spanY + 1,
      endY: modifiedCell.endY + 1 });


    onChange(cellInfoToDateRange(newCell), rangeIndex);
  },
  ref);


  var handleDrag = useCallback(
  function (event, _ref3) {var y = _ref3.y,x = _ref3.x;
    if (moveAxis === 'none' || disabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    var newRect = _objectSpread2({},
    rect);


    if (moveAxis === 'both' || moveAxis === 'y') {
      var startOrEnd1 = y;
      var startOrEnd2 = startOrEnd1 + rect.height;
      var newTop = Math.min(startOrEnd1, startOrEnd2);
      var newBottom = newTop + rect.height;
      newRect.bottom = newBottom;
      newRect.top = newTop;
    }

    if (moveAxis === 'both' || moveAxis === 'x') {
      var _startOrEnd = x;
      var _startOrEnd2 = _startOrEnd + rect.width;
      var newLeft = Math.min(_startOrEnd, _startOrEnd2);
      var newRight = newLeft + rect.width;
      newRect.right = newRight;
      newRect.left = newLeft;
    }var _grid$getCellFromRect =

    grid.getCellFromRect(newRect),startY = _grid$getCellFromRect.startY,startX = _grid$getCellFromRect.startX;

    var newCell = _objectSpread2(_objectSpread2({},
    cell), {}, {
      startX: moveAxis === 'y' ? cell.startX : startX,
      endX: moveAxis === 'x' ? startX + cell.spanX - 1 : cell.endX,
      startY: moveAxis === 'x' ? cell.startY : startY,
      endY: moveAxis === 'y' ? startY + cell.spanY - 1 : cell.endY });


    invariant(
    newCell.spanY === cell.spanY && newCell.spanX === cell.spanX, "Expected the dragged time cell to have the same dimensions");



    setModifiedCell(newCell);
  },
  [grid, rect, moveAxis, disabled, cell, setModifiedCell]);


  var handleResize = useCallback(
  function (event, direction, _ref, delta) {
    if (!isResizable || disabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (delta.height === 0) {
      return;
    }

    var newSize = {
      height: delta.height + rect.height,
      width: delta.width + rect.width + 20 };


    var newRect = _objectSpread2(_objectSpread2({},
    originalRect),
    newSize);


    if (direction.includes('top')) {
      newRect.top -= delta.height;
    } else if (direction.includes('bottom')) {
      newRect.bottom += delta.height;
    }var _grid$getCellFromRect2 =

    grid.getCellFromRect(newRect),spanY = _grid$getCellFromRect2.spanY,startY = _grid$getCellFromRect2.startY,endY = _grid$getCellFromRect2.endY;
    var newCell = _objectSpread2(_objectSpread2({},
    cell), {}, {
      spanY: spanY,
      startY: startY,
      endY: endY });


    setModifiedCell(newCell);
  },
  [grid, rect, disabled, isResizable, setModifiedCell, cell, originalRect]);


  var handleDelete = useCallback(function () {
    if (!onChange || disabled) {
      return;
    }

    onChange(undefined, rangeIndex);
  }, [onChange, disabled, rangeIndex]);

  var handleOnFocus = useCallback(function () {
    if (!onActiveChange || disabled) {
      return;
    }

    onActiveChange([rangeIndex, cellIndex]);
  }, [onActiveChange, disabled, rangeIndex, cellIndex]);

  var handleOnClick = useCallback(function () {
    if (!onClick || disabled || !isActive) {
      return;
    }

    onClick([rangeIndex, cellIndex]);
  }, [onClick, rangeIndex, disabled, isActive, cellIndex]);

  useMousetrap('enter', handleOnClick, ref);

  var cancelClasses = useMemo(
  function () {return (
      classes.handle ?
      classes.handle.
      split(' ').
      map(function (className) {return ".".concat(className);}).
      join(', ') :
      undefined);},
  [classes.handle]);


  return /*#__PURE__*/(
    React.createElement(Draggable, {
      axis: moveAxis,
      bounds: {
        top: 0,
        bottom: grid.totalHeight - height,
        left: 0,
        right: grid.totalWidth },

      position: { x: left, y: top },
      onDrag: handleDrag,
      onStop: handleStop,
      cancel: cancelClasses,
      disabled: disabled }, /*#__PURE__*/

    React.createElement(EventRootComponent, {
      role: "button",
      disabled: disabled,
      onFocus: handleOnFocus,
      onClick: handleOnClick,
      handleDelete: handleDelete,
      cellIndex: cellIndex,
      rangeIndex: rangeIndex,
      isActive: isActive,
      classes: classes,
      className: classcat([
      classes.event,
      classes['range-boxes'],
      className, (_ref4 = {}, _defineProperty(_ref4,

      classes['is-draggable'], !disabled && moveAxis !== 'none'), _defineProperty(_ref4,
      classes['is-disabled'], disabled), _ref4)]),


      ref: ref,
      style: { width: width - 20, height: height } }, /*#__PURE__*/

    React.createElement(Resizable, {
      size: _objectSpread2(_objectSpread2({}, originalRect), {}, { width: originalRect.width - 20 }),
      key: "".concat(rangeIndex, ".").concat(cellIndex, ".").concat(cellArray.length, ".").concat(
      originalRect.top, ".").concat(
      originalRect.left),
      onResize: handleResize,
      onResizeStop: handleStop,
      handleWrapperClass: classes['handle-wrapper'],
      enable:
      isResizable && !disabled ?
      {
        top: true,
        bottom: true } :

      {},

      handleClasses: {
        bottom: classcat([classes.handle, classes.bottom]),
        bottomLeft: classes.handle,
        bottomRight: classes.handle,
        left: classes.handle,
        right: classes.handle,
        top: classcat([classes.handle, classes.top]),
        topLeft: classes.handle,
        topRight: classes.handle } }, /*#__PURE__*/


    React.createElement(EventContentComponent, {
      width: width,
      height: height,
      classes: classes,
      dateRange: modifiedDateRange,
      isStart: isStart,
      isEnd: isEnd })))));





});

var Schedule = /*#__PURE__*/React.memo(function Schedule(_ref)





















{var classes = _ref.classes,ranges = _ref.ranges,grid = _ref.grid,className = _ref.className,onChange = _ref.onChange,isResizable = _ref.isResizable,isDeletable = _ref.isDeletable,moveAxis = _ref.moveAxis,cellInfoToDateRange = _ref.cellInfoToDateRange,dateRangeToCells = _ref.dateRangeToCells,onActiveChange = _ref.onActiveChange,eventContentComponent = _ref.eventContentComponent,eventRootComponent = _ref.eventRootComponent,onClick = _ref.onClick,getIsActive = _ref.getIsActive,disabled = _ref.disabled;
  return /*#__PURE__*/(
    React.createElement("div", { className: classes['range-boxes'] },
    ranges.map(function (dateRange, rangeIndex) {
      return /*#__PURE__*/(
        React.createElement("span", { key: rangeIndex },
        dateRangeToCells(dateRange).map(function (cell, cellIndex, cellArray) {
          return /*#__PURE__*/(
            React.createElement(RangeBox, {
              classes: classes,
              onActiveChange: onActiveChange,
              key: "".concat(rangeIndex, ".").concat(ranges.length, ".").concat(cellIndex, ".").concat(
              cellArray.length),

              isResizable: isResizable,
              moveAxis: moveAxis,
              isDeletable: isDeletable,
              cellInfoToDateRange: cellInfoToDateRange,
              cellArray: cellArray,
              cellIndex: cellIndex,
              rangeIndex: rangeIndex,
              className: className,
              onChange: onChange,
              onClick: onClick,
              grid: grid,
              cell: cell,
              getIsActive: getIsActive,
              eventContentComponent: eventContentComponent,
              eventRootComponent: eventRootComponent,
              disabled: disabled }));


        })));


    })));


});

var MINS_IN_DAY = 24 * 60;
var horizontalPrecision = 1;
var toDay = function toDay(x) {return x * horizontalPrecision;};
var toX = function toX(days) {return days / horizontalPrecision;};
var DELETE_KEYS = ['del', 'backspace'];

var TimeGridScheduler = /*#__PURE__*/React.memo(function TimeGridScheduler(_ref)




























































{var _ref$verticalPrecisio = _ref.verticalPrecision,verticalPrecision = _ref$verticalPrecisio === void 0 ? 30 : _ref$verticalPrecisio,_ref$visualGridVertic = _ref.visualGridVerticalPrecision,visualGridVerticalPrecision = _ref$visualGridVertic === void 0 ? 30 : _ref$visualGridVertic,_ref$cellClickPrecisi = _ref.cellClickPrecision,cellClickPrecision = _ref$cellClickPrecisi === void 0 ? visualGridVerticalPrecision : _ref$cellClickPrecisi,style = _ref.style,schedule = _ref.schedule,_ref$originDate = _ref.originDate,_originDate = _ref$originDate === void 0 ? new Date() : _ref$originDate,_ref$defaultHours = _ref.defaultHours,defaultHours = _ref$defaultHours === void 0 ? [9, 15] : _ref$defaultHours,classes = _ref.classes,className = _ref.className,onChange = _ref.onChange,onEventClick = _ref.onEventClick,eventContentComponent = _ref.eventContentComponent,eventRootComponent = _ref.eventRootComponent,disabled = _ref.disabled;var _useContext =
  useContext(SchedulerContext),locale = _useContext.locale;
  var originDate = useMemo(function () {return startOfDay(_originDate);}, [_originDate]);
  var numVerticalCells = MINS_IN_DAY / verticalPrecision;
  var numHorizontalCells = 7 / horizontalPrecision;
  var toMin = useCallback(function (y) {return y * verticalPrecision;}, [
  verticalPrecision]);

  var toY = useCallback(function (mins) {return mins / verticalPrecision;}, [
  verticalPrecision]);


  var cellInfoToDateRanges = useMemo(function () {
    return createMapCellInfoToRecurringTimeRange({
      originDate: originDate,
      fromY: toMin,
      fromX: toDay });

  }, [toMin, originDate]);

  var cellInfoToSingleDateRange = useCallback(
  function (cell) {var _cellInfoToDateRanges =
    cellInfoToDateRanges(cell),_cellInfoToDateRanges2 = _toArray(_cellInfoToDateRanges),first = _cellInfoToDateRanges2[0],rest = _cellInfoToDateRanges2.slice(1);
    invariant(
    rest.length === 0, "Expected \"cellInfoToSingleDateRange\" to return a single date range, found ".concat(

    rest.length, " additional ranges instead. This is a bug in @remotelock/react-week-scheduler"));



    return first;
  },
  [cellInfoToDateRanges]);


  var dateRangeToCells = useMemo(function () {
    return createMapDateRangeToCells({
      originDate: originDate,
      numVerticalCells: numVerticalCells,
      numHorizontalCells: numHorizontalCells,
      toX: toX,
      toY: toY });

  }, [toY, numVerticalCells, numHorizontalCells, originDate]);

  var root = useRef(null);
  var parent = useRef(null);

  var size = useComponentSize(parent);var _useClickAndDrag =






  useClickAndDrag(parent, disabled),dragBoxStyle = _useClickAndDrag.style,box = _useClickAndDrag.box,isDragging = _useClickAndDrag.isDragging,hasFinishedDragging = _useClickAndDrag.hasFinishedDragging,cancel = _useClickAndDrag.cancel;var _useState =



  useState(null),_useState2 = _slicedToArray(_useState, 2),pendingCreation = _useState2[0],setPendingCreation = _useState2[1];var _useState3 =

  useState([0, 0]),_useState4 = _slicedToArray(_useState3, 2),_useState4$ = _slicedToArray(_useState4[0], 2),totalHeight = _useState4$[0],totalWidth = _useState4$[1],setDimensions = _useState4[1];

  var numVisualVerticalCells = 24 * 60 / visualGridVerticalPrecision;

  useEffect(
  function updateGridDimensionsOnSizeOrCellCountChange() {
    if (!parent.current) {
      setDimensions([0, 0]);
      return;
    }

    setDimensions([parent.current.scrollHeight, parent.current.scrollWidth]);
  },
  [size, numVisualVerticalCells]);


  var grid = useMemo(function () {
    if (totalHeight === null || totalWidth === null) {
      return null;
    }

    return createGrid({
      totalHeight: totalHeight,
      totalWidth: totalWidth,
      numHorizontalCells: numHorizontalCells,
      numVerticalCells: numVerticalCells });

  }, [totalHeight, totalWidth, numHorizontalCells, numVerticalCells]);

  useEffect(
  function updatePendingCreationOnDragBoxUpdate() {
    if (grid === null || box === null) {
      setPendingCreation(null);
      return;
    }

    var cell = grid.getCellFromRect(box);
    var dateRanges = cellInfoToDateRanges(cell);
    var event = dateRanges;
    setPendingCreation(event);
  },
  [box, grid, cellInfoToDateRanges, toY]);var _useState5 =


  useState(

  [null, null]),_useState6 = _slicedToArray(_useState5, 2),_useState6$ = _slicedToArray(_useState6[0], 2),activeRangeIndex = _useState6$[0],activeCellIndex = _useState6$[1],setActive = _useState6[1];

  useEffect(
  function updateScheduleAfterDraggingFinished() {
    if (disabled) {
      return;
    }

    if (hasFinishedDragging) {
      onChange(mergeEvents(schedule, pendingCreation));
      setPendingCreation(null);
    }
  },
  [
  hasFinishedDragging,
  disabled,
  onChange,
  setPendingCreation,
  pendingCreation,
  schedule]);



  useEffect(
  function clearActiveBlockAfterCreation() {
    if (pendingCreation === null) {
      setActive([null, null]);
    }
  },
  [pendingCreation]);


  var handleEventChange = useCallback(
  function (newDateRange, rangeIndex) {
    if (disabled) {
      return;
    }

    if (!schedule && newDateRange) {
      onChange([newDateRange]);

      return;
    }

    var newSchedule = _toConsumableArray(schedule);

    if (!newDateRange) {
      newSchedule.splice(rangeIndex, 1);
    } else {
      if (
      isDateEqual(newDateRange[0], newSchedule[rangeIndex][0]) &&
      isDateEqual(newDateRange[1], newSchedule[rangeIndex][1]))
      {
        return;
      }
      newSchedule[rangeIndex] = newDateRange;
    }

    newSchedule = mergeRanges(newSchedule);

    onChange(newSchedule);
  },
  [schedule, onChange, disabled]);


  useMousetrap(
  'esc',
  function cancelOnEsc() {
    if (pendingCreation) {
      cancel();
    }
  },
  document);


  var getIsActive = useCallback(
  function (_ref2) {var rangeIndex = _ref2.rangeIndex,cellIndex = _ref2.cellIndex;
    return rangeIndex === activeRangeIndex && cellIndex === activeCellIndex;
  },
  [activeCellIndex, activeRangeIndex]);


  var handleDelete = useCallback(
  function (e) {
    if (activeRangeIndex === null || disabled) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    handleEventChange(undefined, activeRangeIndex);
  },
  [activeRangeIndex, disabled, handleEventChange]);


  useMousetrap(DELETE_KEYS, handleDelete, root);

  useEffect(
  function cancelPendingCreationOnSizeChange() {
    cancel();
  },
  [size, cancel]);


  var getDateRangeForVisualGrid = useMemo(function () {
    return createMapCellInfoToRecurringTimeRange({
      originDate: originDate,
      fromX: toDay,
      fromY: function fromY(y) {return y * visualGridVerticalPrecision;} });

  }, [visualGridVerticalPrecision, originDate]);

  useEffect(
  function scrollToActiveTimeBlock() {
    if (!document.activeElement) {
      return;
    }

    if (!root.current || !root.current.contains(document.activeElement)) {
      return;
    }

    scrollIntoView(document.activeElement, {
      scrollMode: 'if-needed',
      block: 'nearest',
      inline: 'nearest' });

  },
  [schedule]);var _useState7 =


  useState(
  false),_useState8 = _slicedToArray(_useState7, 2),wasInitialScrollPerformed = _useState8[0],setWasInitialScrollPerformed = _useState8[1];


  useEffect(
  function performInitialScroll() {
    if (wasInitialScrollPerformed || !root.current || !grid) {
      return;
    }

    var range = dateRangeToCells(
    getEarliestTimeRange(schedule) || [
    addHours(originDate, defaultHours[0]),
    addHours(originDate, defaultHours[1])]);


    var rect = grid.getRectFromCell(range[0]);var
    top = rect.top,bottom = rect.bottom;

    if (top === 0 && bottom === 0) {
      return;
    }

    // IE, Edge do not support it
    if (!('scrollBy' in root.current)) {
      return;
    }

    root.current.scrollBy(0, top);

    setWasInitialScrollPerformed(true);
  },
  [
  wasInitialScrollPerformed,
  grid,
  schedule,
  defaultHours,
  originDate,
  dateRangeToCells]);



  var handleBlur = useCallback(
  function (event) {
    if (!event.target.contains(document.activeElement)) {
      setActive([null, null]);
    }
  },
  [setActive]);


  var handleCellClick = useCallback(
  function (dayIndex, timeIndex) {return function (event) {
      if (!grid || disabled) {
        return;
      }

      var spanY = toY(cellClickPrecision);
      var cell = {
        startX: dayIndex,
        startY: timeIndex,
        endX: dayIndex,
        endY: spanY + timeIndex,
        spanY: spanY,
        spanX: getSpan(dayIndex, dayIndex) };


      var dateRanges = cellInfoToDateRanges(cell);

      setPendingCreation(dateRanges);

      event.stopPropagation();
      event.preventDefault();
    };},
  [grid, disabled, toY, cellClickPrecision, cellInfoToDateRanges]);


  return /*#__PURE__*/(
    React.createElement("div", {
      ref: root,
      style: style,
      onBlur: handleBlur,
      "touch-action": isDragging ? 'none' : undefined,
      className: classcat([
      classes.root,
      classes.theme,
      className, _defineProperty({},
      classes['no-scroll'], isDragging)]) }, /*#__PURE__*/


    React.createElement("div", { className: classes['grid-root'] }, /*#__PURE__*/
    React.createElement("div", {
      "aria-hidden": true,
      className: classcat([classes.timeline, classes['sticky-left']]) }, /*#__PURE__*/

    React.createElement("div", { className: classes.header }, /*#__PURE__*/
    React.createElement("div", { className: classes['day-column'] }, /*#__PURE__*/
    React.createElement("div", { className: classcat([classes.cell, classes.title]) }, "T"))), /*#__PURE__*/


    React.createElement("div", { className: classes.calendar }, /*#__PURE__*/
    React.createElement("div", { className: classes['day-column'] }, /*#__PURE__*/
    React.createElement("div", { className: classes['day-hours'] },
    times(numVisualVerticalCells).map(function (timeIndex) {
      return /*#__PURE__*/(
        React.createElement(Cell, {
          classes: classes,
          getDateRangeForVisualGrid: getDateRangeForVisualGrid,
          key: timeIndex,
          timeIndex: timeIndex },

        function (_ref4) {var start = _ref4.start,isHourStart = _ref4.isHourStart;
          if (isHourStart) {
            return /*#__PURE__*/(
              React.createElement("div", { className: classes.time },
              format(start, 'h a', { locale: locale })));


          }

          return null;
        }));


    }))))), /*#__PURE__*/




    React.createElement("div", {
      className: classcat([
      classes['sticky-top'],
      classes['day-header-row']]) }, /*#__PURE__*/


    React.createElement("div", {
      role: "presentation",
      className: classcat([classes.calendar, classes.header]) },

    times(7).map(function (i) {return /*#__PURE__*/(
        React.createElement("div", {
          key: i,
          role: "presentation",
          className: classes['day-column'] }, /*#__PURE__*/

        React.createElement("div", { className: classcat([classes.cell, classes.title]) },
        format(addDays(originDate, i), 'ddd', { locale: locale }))));}))), /*#__PURE__*/





    React.createElement("div", { className: classes['layer-container'] },
    isDragging && /*#__PURE__*/
    React.createElement("div", { className: classes['drag-box'], style: dragBoxStyle },
    hasFinishedDragging && /*#__PURE__*/React.createElement("div", { className: classes.popup })),


    grid && pendingCreation && isDragging && /*#__PURE__*/
    React.createElement(Schedule, {
      classes: classes,
      dateRangeToCells: dateRangeToCells,
      cellInfoToDateRange: cellInfoToSingleDateRange,
      className: classes['is-pending-creation'],
      ranges: mergeEvents(schedule, pendingCreation),
      grid: grid,
      moveAxis: "none",
      eventContentComponent: eventContentComponent,
      getIsActive: getIsActive }),


    grid && !pendingCreation && /*#__PURE__*/
    React.createElement(Schedule, {
      classes: classes,
      onActiveChange: setActive,
      dateRangeToCells: dateRangeToCells,
      cellInfoToDateRange: cellInfoToSingleDateRange,
      isResizable: true,
      moveAxis: "y",
      isDeletable: true,
      onChange: handleEventChange,
      onClick: onEventClick,
      ranges: schedule,
      grid: grid,
      eventContentComponent: eventContentComponent,
      eventRootComponent: eventRootComponent,
      getIsActive: getIsActive,
      disabled: disabled }), /*#__PURE__*/



    React.createElement("div", { ref: parent, role: "grid", className: classes.calendar },
    times(7).map(function (dayIndex) {
      return /*#__PURE__*/(
        React.createElement("div", {
          role: "gridcell",
          key: dayIndex,
          className: classes['day-column'] }, /*#__PURE__*/

        React.createElement("div", { className: classes['day-hours'] },
        times(numVisualVerticalCells).map(function (timeIndex) {
          return /*#__PURE__*/(
            React.createElement(Cell, {
              classes: classes,
              onClick: handleCellClick(
              dayIndex,
              timeIndex * (
              numVerticalCells / numVisualVerticalCells)),

              getDateRangeForVisualGrid: getDateRangeForVisualGrid,
              key: timeIndex,
              timeIndex: timeIndex }));


        }))));



    }))))));





}, isEqual);

var styles_module = {"no-scroll":"styles-module_no-scroll__3IUv5","theme":"styles-module_theme__1FIRA","root":"styles-module_root__2iNXQ","grid-root":"styles-module_grid-root__2ktzS","debug":"styles-module_debug__2eCNx","debug-active":"styles-module_debug-active__QqNIZ","calendar":"styles-module_calendar__tGgRK","react-draggable":"styles-module_react-draggable__3LVqd","handle-wrapper":"styles-module_handle-wrapper__26Eew","handle":"styles-module_handle__LTyBN","top":"styles-module_top__3D7og","bottom":"styles-module_bottom__daw_j","layer-container":"styles-module_layer-container__1wxVL","event":"styles-module_event__1PixZ","drag-box":"styles-module_drag-box__3w784","draggable":"styles-module_draggable__1Z1sE","button-reset":"styles-module_button-reset__1EwGq","is-draggable":"styles-module_is-draggable__176XM","is-pending-creation":"styles-module_is-pending-creation__3Qr4x","is-disabled":"styles-module_is-disabled__2JPDR","hours-container":"styles-module_hours-container__2srEU","day-column":"styles-module_day-column__30McI","day-hours":"styles-module_day-hours__1E9lT","cell":"styles-module_cell__sVJZY","time":"styles-module_time__LJQW4","title":"styles-module_title__2VBFp","is-hour-start":"styles-module_is-hour-start__1_0Zo","header":"styles-module_header__10uIZ","day-header-row":"styles-module_day-header-row__27lss","sticky-top":"styles-module_sticky-top__2dSgb","sticky-left":"styles-module_sticky-left__3tNLK","first":"styles-module_first__IeNvS","popup":"styles-module_popup__2iu0Y","range-boxes":"styles-module_range-boxes__ib1Nb","event-content":"styles-module_event-content__3sakH","start":"styles-module_start__3CzHL","end":"styles-module_end__2L7Oy","timeline":"styles-module_timeline__1hCLT"};

export { DefaultEventRootComponent, SchedulerContext, TimeGridScheduler, styles_module as classes, getFormattedComponentsForDateRange as getFormattedTimeRangeComponents, getTextForDateRange, useMousetrap };
//# sourceMappingURL=index.mjs.map
