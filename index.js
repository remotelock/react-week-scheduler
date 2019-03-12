'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var useComponentSize = _interopDefault(require('@rehooks/component-size'));
var classcat = _interopDefault(require('classcat'));
var dateFns = require('date-fns');
var invariant = _interopDefault(require('invariant'));
var lodash = require('lodash');
var React = require('react');
var React__default = _interopDefault(React);
var scrollIntoView = _interopDefault(require('scroll-into-view-if-needed'));
var rxjs = require('rxjs');
var operators = require('rxjs/operators');
var mousetrap = _interopDefault(require('mousetrap'));
var _mergeRanges = _interopDefault(require('merge-ranges'));
var VisuallyHidden = _interopDefault(require('@reach/visually-hidden'));
var Resizable = _interopDefault(require('re-resizable'));
var Draggable = _interopDefault(require('react-draggable'));

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

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toArray(arr) {
  return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
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

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

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

var prevent = operators.tap(function (e) {
  e.preventDefault();
  e.stopPropagation();
});

function useClickAndDrag(ref) {var _useState =
  React.useState({
    transform: 'translate(0, 0)',
    width: 0,
    height: 0 }),_useState2 = _slicedToArray(_useState, 2),style = _useState2[0],setStyle = _useState2[1];var _useState3 =

  React.useState(null),_useState4 = _slicedToArray(_useState3, 2),box = _useState4[0],setBox = _useState4[1];var _useState5 =
  React.useState(false),_useState6 = _slicedToArray(_useState5, 2),isDragging = _useState6[0],setIsDragging = _useState6[1];var _useState7 =
  React.useState(false),_useState8 = _slicedToArray(_useState7, 2),hasFinishedDragging = _useState8[0],setHasFinishedDragging = _useState8[1];

  React.useEffect(function () {
    var container = ref.current;
    if (!container) {
      return;
    }

    var mapCoordsToContainer = createPageMapCoordsToContainer(container);

    var touchMove$ = rxjs.fromEvent(window, 'touchmove', {
      passive: false }).
    pipe(prevent);

    var touchEnd$ = rxjs.fromEvent(window, 'touchend', {
      passive: true });


    var touchStart$ = rxjs.fromEvent(container, 'touchstart', {
      passive: false });


    var touchStartWithDelay$ = touchStart$.pipe(
    operators.mergeMap(function (start) {return (
        rxjs.of(start).pipe(
        operators.delay(300),
        operators.takeUntil(touchMove$),
        prevent));}));




    var mouseDown$ = rxjs.fromEvent(container, 'mousedown', {
      passive: true }).
    pipe(operators.filter(function (event) {return event.which === 1;}));

    var mouseMove$ = rxjs.fromEvent(window, 'mousemove', {
      passive: true });


    var mouseUp$ = rxjs.fromEvent(window, 'mouseup', {
      passive: true });


    var dragStart$ = rxjs.merge(mouseDown$, touchStartWithDelay$).pipe(
    operators.map(mapCoordsToContainer));


    var dragEnd$ = rxjs.merge(mouseUp$, touchEnd$).pipe(
    operators.map(mapCoordsToContainer),
    operators.tap(function () {
      setIsDragging(false);
      setHasFinishedDragging(true);
    }));


    var move$ = rxjs.merge(mouseMove$, touchMove$).pipe(operators.map(mapCoordsToContainer));

    var box$ = dragStart$.pipe(
    operators.tap(function () {
      setIsDragging(true);
      setHasFinishedDragging(false);
    }),
    operators.mergeMap(function (down) {
      return move$.pipe(
      operators.startWith(down),
      operators.map(
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

      operators.takeUntil(dragEnd$));

    }),
    operators.distinctUntilChanged(lodash.isEqual));


    var style$ = box$.pipe(
    operators.map(function (_ref) {var top = _ref.top,left = _ref.left,width = _ref.width,height = _ref.height;return {
        transform: "translate(".concat(left, "px, ").concat(top, "px)"),
        width: width,
        height: height };}));



    var boxSubscriber = box$.subscribe(setBox);
    var styleSubscriber = style$.subscribe(setStyle);

    return function () {
      boxSubscriber.unsubscribe();
      styleSubscriber.unsubscribe();
    };
  }, [ref.current]);

  var cancel = React.useCallback(function () {
    setIsDragging(false);
    setHasFinishedDragging(false);
    setBox(null);
  }, [setBox]);

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
element)
{
  var actionRef = React.useRef(null);
  actionRef.current = handlerCallback;

  React.useEffect(function () {
    if (!element) {
      return;
    }

    Mousetrap(element).bind(handlerKey, function () {
      typeof actionRef.current === 'function' && actionRef.current();
    });

    return function () {
      mousetrap.unbind(handlerKey);
    };
  }, [handlerKey, element]);
}

function useEventListener(



ref,
event,
listener,
options)

{var _ref = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {},_ref$enabled = _ref.enabled,enabled = _ref$enabled === void 0 ? true : _ref$enabled;
  React.useEffect(function () {
    if (ref.current === null) {
      return;
    }

    if (enabled) {
      ref.current.addEventListener(event, listener, options);
    } else if (listener) {
      ref.current.removeEventListener(event, listener);
    }

    return function () {
      if (!ref.current) {
        return;
      }

      ref.current.removeEventListener(event, listener);
    };
  }, [ref.current, listener, options, enabled]);
}

function useScrollPosition(
root)

{var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},_ref$passive = _ref.passive,passive = _ref$passive === void 0 ? true : _ref$passive,_ref$enabled = _ref.enabled,enabled = _ref$enabled === void 0 ? true : _ref$enabled;var _useState =
  React.useState({ scrollTop: 0, scrollLeft: 0 }),_useState2 = _slicedToArray(_useState, 2),position = _useState2[0],setPosition = _useState2[1];

  useEventListener(
  root,
  'scroll',
  function (event) {
    if (event && event.target) {
      // @ts-ignore
      var _event$target = event.target,scrollTop = _event$target.scrollTop,scrollLeft = _event$target.scrollLeft;
      setPosition({ scrollTop: scrollTop, scrollLeft: scrollLeft });
    }
  },
  { passive: passive },
  { enabled: enabled });


  return position;
}

function useStickyStyle(
scrollParent, _ref)

{var _ref$top = _ref.top,top = _ref$top === void 0 ? false : _ref$top,_ref$left = _ref.left,left = _ref$left === void 0 ? false : _ref$left;var _useScrollPosition =
  useScrollPosition(scrollParent, {
    enabled: top || left }),scrollLeft = _useScrollPosition.scrollLeft,scrollTop = _useScrollPosition.scrollTop;


  var stickyStyle = React.useMemo(
  function () {return {
      transform: "translate(".concat(left ? scrollLeft : 0, "px, ").concat(
      top ? scrollTop : 0, "px)"),

      zIndex: 3 };},

  [left ? scrollLeft : 0, top ? scrollTop : 0]);


  return stickyStyle;
}

var getSpan = function getSpan(x1, x2) {return 1 + Math.abs(x2 - x1);};

var createGrid = function createGrid(_ref)









{var totalHeight = _ref.totalHeight,totalWidth = _ref.totalWidth,numVerticalCells = _ref.numVerticalCells,numHorizontalCells = _ref.numHorizontalCells;
  var cellHeight = lodash.floor(totalHeight / numVerticalCells);
  var cellWidth = lodash.floor(totalWidth / numHorizontalCells);

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
      var startX = lodash.clamp(
      lodash.floor(data.left / this.cellWidth),
      0,
      numHorizontalCells - 1);

      var startY = lodash.clamp(
      lodash.round(data.top / this.cellHeight),
      0,
      numVerticalCells - 1);

      var endX = lodash.clamp(
      lodash.floor(data.right / this.cellWidth),
      0,
      numHorizontalCells - 1);

      var endY = lodash.clamp(
      lodash.round(data.bottom / this.cellHeight),
      0,
      numVerticalCells - 1);

      var spanX = lodash.clamp(getSpan(startX, endX), 1, numHorizontalCells);
      var spanY = lodash.clamp(getSpan(startY, endY), 1, numVerticalCells);

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






    dateFns.addMinutes(dateFns.addDays(originDate, startX), toMin(startY)));};

var createMapCellInfoToContiguousDateRange = function createMapCellInfoToContiguousDateRange(_ref) {var
  toMin = _ref.fromY,
  toDay = _ref.fromX,
  originDate = _ref.originDate;return (
    function (_ref2) {var startX = _ref2.startX,startY = _ref2.startY,endX = _ref2.endX,endY = _ref2.endY;
      var startDate = cellToDate({ startX: startX, startY: startY, toMin: toMin, toDay: toDay, originDate: originDate });
      var endDate = cellToDate({
        startX: endX,
        startY: endY,
        toMin: toMin,
        toDay: toDay,
        originDate: originDate });


      return [
      dateFns.isBefore(startDate, endDate) ? [startDate, endDate] : [endDate, startDate]];

    });};

var createMapCellInfoToRecurringTimeRange = function createMapCellInfoToRecurringTimeRange(_ref) {var
  toMin = _ref.fromY,
  toDay = _ref.fromX,
  originDate = _ref.originDate;return (
    function (_ref2) {var startX = _ref2.startX,startY = _ref2.startY,endX = _ref2.endX,spanY = _ref2.spanY;
      var result = lodash.range(startX, endX + 1).
      map(function (i) {
        var startDate = cellToDate({
          startX: i,
          startY: startY,
          toMin: toMin,
          toDay: toDay,
          originDate: originDate });

        var endDate = dateFns.addMinutes(startDate, toMin(spanY));

        if (dateFns.isEqual(endDate, dateFns.startOfDay(endDate))) {
          endDate = dateFns.endOfDay(dateFns.subDays(endDate, 1));
        }

        var range = dateFns.isBefore(startDate, endDate) ?
        [startDate, endDate] :
        [endDate, startDate];

        return range;
      }).
      sort(function (range1, range2) {return dateFns.compareAsc(range1[0], range2[0]);});

      return result;
    });};

var createMapDateRangeToCells = function createMapDateRangeToCells(_ref) {var _ref$toX = _ref.
  toX,toX = _ref$toX === void 0 ? function (x) {return x;} : _ref$toX,
  toY = _ref.toY,
  numVerticalCells = _ref.numVerticalCells,
  originDate = _ref.originDate;return (






    function (_ref2) {var _ref3 = _slicedToArray(_ref2, 2),start = _ref3[0],end = _ref3[1];
      var originOfThisDay = dateFns.startOfDay(start);
      var _startX = toX(dateFns.differenceInDays(start, originDate));
      var _startY = toY(dateFns.differenceInMinutes(start, originOfThisDay));
      var _endX = toX(dateFns.differenceInDays(end, originDate));
      var _endY = toY(dateFns.differenceInMinutes(end, dateFns.startOfDay(end))) - 1;

      var cells = lodash.range(_startX, _endX + 1).map(function (i) {
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

      if (dateFns.isEqual(end, dateFns.startOfDay(end))) {
        cells.pop();
      }

      return cells;
    });};

function mergeRanges(event) {
  return _mergeRanges(_toConsumableArray(event).map(function (d) {return d.map(function (c) {return new Date(c);});}));
}

function mergeEvents(
event1,
event2)
{
  if (event2 === null) {
    return event1;
  }

  return mergeRanges([].concat(_toConsumableArray(event1), _toConsumableArray(event2))).sort(function (range1, range2) {return (
      dateFns.compareAsc(range1[0], range2[0]));});

}

var Cell = React__default.memo(function Cell(_ref)









{var timeIndex = _ref.timeIndex,children = _ref.children,classes = _ref.classes,getDateRangeForVisualGrid = _ref.getDateRangeForVisualGrid;var _getDateRangeForVisua =
  getDateRangeForVisualGrid({
    startX: 0,
    startY: timeIndex,
    endX: 0,
    endY: timeIndex + 1,
    spanX: 1,
    spanY: 1 }),_getDateRangeForVisua2 = _slicedToArray(_getDateRangeForVisua, 1),_getDateRangeForVisua3 = _slicedToArray(_getDateRangeForVisua2[0], 1),start = _getDateRangeForVisua3[0];


  var isHourStart = dateFns.getMinutes(start) === 0;

  return (
    React__default.createElement("div", {
      className: classcat([
      classes.cell, _defineProperty({},
      classes['is-hour-start'], isHourStart)]) },


    children && children({ start: start, isHourStart: isHourStart })));


});

var dropSame = function dropSame(
dates,
template)

{var takeSecond = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;var _dates$map =
  dates.map(function (date) {return dateFns.format(date, template);}),_dates$map2 = _slicedToArray(_dates$map, 2),first = _dates$map2[0],second = _dates$map2[1];
  if (first !== second) {
    return [first, second];
  }

  if (takeSecond) {
    return ['', second];
  }

  return [first, ''];
};

var formatHour = function formatHour(date) {
  if (dateFns.getMinutes(date) === 0) {
    return dateFns.format(date, 'h');
  }

  return dateFns.format(date, 'h:m');
};

var getTextForDateRange = function getTextForDateRange(
dates,
template,
template2)
{
  var start = dates[0];
  var end = dates[dates.length - 1];

  if (dateFns.isSameDay(start, end) && !template) {var _dropSame =
    dropSame(dates, 'a', true),_dropSame2 = _slicedToArray(_dropSame, 2),firstM = _dropSame2[0],secondM = _dropSame2[1];
    return "".concat(dateFns.format(start, 'ddd'), " ").concat(formatHour(
    start)).concat(
    firstM, " \u2013 ").concat(formatHour(end)).concat(secondM);
  }

  var formatTemplate = 'ddd h:mma';
  var startDateStr = dateFns.format(start, template || formatTemplate);
  var endDateStr = dateFns.format(end, template2 || formatTemplate);

  return "".concat(startDateStr, " \u2013 ").concat(endDateStr);
};

var RangeBox = React__default.memo(function RangeBox(_ref2)



















{var _ref4;var classes = _ref2.classes,grid = _ref2.grid,isBeingEdited = _ref2.isBeingEdited,rangeIndex = _ref2.rangeIndex,cellIndex = _ref2.cellIndex,cellArray = _ref2.cellArray,cell = _ref2.cell,className = _ref2.className,onChange = _ref2.onChange,cellInfoToDateRange = _ref2.cellInfoToDateRange,isResizable = _ref2.isResizable,moveAxis = _ref2.moveAxis,onActiveChange = _ref2.onActiveChange;
  var ref = React.useRef(null);var _useState =
  React.useState(cell),_useState2 = _slicedToArray(_useState, 2),modifiedCell = _useState2[0],setModifiedCell = _useState2[1];
  var originalRect = React.useMemo(function () {return grid.getRectFromCell(cell);}, [cell, grid]);
  var rect = React.useMemo(function () {return grid.getRectFromCell(modifiedCell);}, [
  modifiedCell,
  grid]);


  React.useEffect(function () {
    setModifiedCell(cell);
  }, [cell]);

  var modifiedDateRange = React.useMemo(function () {return cellInfoToDateRange(modifiedCell);}, [
  modifiedCell]);var


  top = rect.top,left = rect.left,width = rect.width,height = rect.height;

  var isStart = cellIndex === 0;
  var isEnd = cellIndex === cellArray.length - 1;

  var handleStop = React.useCallback(function () {
    if (!onChange) {
      return;
    }

    onChange(cellInfoToDateRange(modifiedCell), rangeIndex);
  }, [modifiedCell, rangeIndex, cellInfoToDateRange, onChange]);

  useMousetrap(
  'up',
  function () {
    if (!onChange) {
      return;
    }

    if (moveAxis === 'none' || moveAxis === 'x') {
      return;
    }

    if (modifiedCell.startY === 0) {
      return;
    }

    var newCell = _objectSpread({},
    modifiedCell, {
      startY: modifiedCell.startY - 1,
      endY: modifiedCell.endY - 1 });


    onChange(cellInfoToDateRange(newCell), rangeIndex);
  },
  ref.current);


  useMousetrap(
  'down',
  function () {
    if (!onChange) {
      return;
    }

    if (moveAxis === 'none' || moveAxis === 'x') {
      return;
    }

    if (modifiedCell.endY === grid.numVerticalCells - 1) {
      return;
    }

    var newCell = _objectSpread({},
    modifiedCell, {
      startY: modifiedCell.startY + 1,
      endY: modifiedCell.endY + 1 });


    onChange(cellInfoToDateRange(newCell), rangeIndex);
  },
  ref.current);


  var handleDrag = React.useCallback(
  function (event, _ref3) {var y = _ref3.y,x = _ref3.x;
    if (moveAxis === 'none') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    var newRect = _objectSpread({},
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

    var newCell = _objectSpread({},
    cell, {
      startX: startX,
      endX: startX + cell.spanX - 1,
      startY: startY,
      endY: startY + cell.spanY - 1 });


    invariant(
    newCell.spanY === cell.spanY && newCell.spanX === cell.spanX, "Expected the dragged time cell to have the same dimensions)");



    setModifiedCell(newCell);
  },
  [grid, rect, moveAxis, setModifiedCell]);


  var handleResize = React.useCallback(
  function (event, direction, _ref, delta) {
    if (!isResizable) {
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


    var newRect = _objectSpread({},
    originalRect,
    newSize);


    if (direction.includes('top')) {
      newRect.top -= delta.height;
    } else if (direction.includes('bottom')) {
      newRect.bottom += delta.height;
    }var _grid$getCellFromRect2 =

    grid.getCellFromRect(newRect),spanY = _grid$getCellFromRect2.spanY,startY = _grid$getCellFromRect2.startY,endY = _grid$getCellFromRect2.endY;
    var newCell = _objectSpread({},
    cell, {
      spanY: spanY,
      startY: startY,
      endY: endY });


    setModifiedCell(newCell);
  },
  [grid, rect, isResizable, setModifiedCell, originalRect]);


  var handleOnFocus = React.useCallback(function () {
    if (!onActiveChange) {
      return;
    }

    onActiveChange([rangeIndex, cellIndex]);
  }, [onActiveChange, rangeIndex, cellIndex]);

  return (
    React__default.createElement(Draggable, {
      axis: moveAxis,
      bounds: {
        top: 0,
        bottom: grid.totalHeight - height,
        left: 0,
        right: grid.totalWidth },

      position: { x: left, y: top },
      onDrag: handleDrag,
      onStop: handleStop,
      cancel: ".".concat(classes.handle) },

    React__default.createElement("button", {
      type: "button",
      onFocus: handleOnFocus,
      className: classcat([
      classes.event,
      classes['button-reset'],
      classes['range-box'],
      className, (_ref4 = {}, _defineProperty(_ref4,

      classes['is-draggable'], moveAxis !== 'none'), _defineProperty(_ref4,
      classes['is-being-edited'], isBeingEdited && isBeingEdited(cell)), _ref4)]),


      ref: ref,
      tabIndex: 0,
      style: { width: width - 20, height: height } },

    React__default.createElement(Resizable, {
      size: _objectSpread({}, originalRect, { width: originalRect.width - 20 }),
      key: "".concat(rangeIndex, ".").concat(cellIndex, ".").concat(cellArray.length, ".").concat(
      originalRect.top, ".").concat(
      originalRect.left),
      onResize: handleResize,
      onResizeStop: handleStop,
      handleWrapperClass: classes['handle-wrapper'],
      enable:
      isResizable ?
      {
        top: true,
        bottom: true } :

      {},

      handleClasses: {
        bottom: classcat([classes.handle, classes.bottom]),
        bottomLeft: classcat([classes.handle, classes['bottom-left']]),
        bottomRight: classcat([classes.handle, classes['bottom-right']]),
        left: classcat([classes.handle, classes.left]),
        right: classcat([classes.handle, classes.right]),
        top: classcat([classes.handle, classes.top]),
        topLeft: classcat([classes.handle, classes['top-left']]),
        topRight: classcat([classes.handle, classes['top-right']]) } },


    React__default.createElement("div", {
      style: { width: width - 20, height: height },
      className: classes['event-content'] },

    React__default.createElement(VisuallyHidden, null,
    getTextForDateRange(modifiedDateRange)),

    React__default.createElement("span", { "aria-hidden": true, className: classes.start },
    isStart && dateFns.format(modifiedDateRange[0], 'h:mma')),

    React__default.createElement("span", { "aria-hidden": true, className: classes.end },
    isEnd && dateFns.format(modifiedDateRange[1], 'h:mma')))))));






});

var Schedule = React__default.memo(function Schedule(_ref)

















{var classes = _ref.classes,ranges = _ref.ranges,grid = _ref.grid,className = _ref.className,onChange = _ref.onChange,isResizable = _ref.isResizable,isDeletable = _ref.isDeletable,isMovable = _ref.moveAxis,cellInfoToDateRange = _ref.cellInfoToDateRange,dateRangeToCells = _ref.dateRangeToCells,isBeingEdited = _ref.isBeingEdited,onActive = _ref.onActiveChange;
  return (
    React__default.createElement("div", { className: classes['range-boxes'] },
    ranges.map(function (dateRange, rangeIndex) {
      return (
        React__default.createElement("span", { key: rangeIndex },
        dateRangeToCells(dateRange).map(function (cell, cellIndex, cellArray) {
          return (
            React__default.createElement(RangeBox, {
              classes: classes,
              onActiveChange: onActive,
              key: "".concat(rangeIndex, ".").concat(ranges.length, ".").concat(cellIndex, ".").concat(
              cellArray.length),

              isResizable: isResizable,
              moveAxis: isMovable,
              isDeletable: isDeletable,
              cellInfoToDateRange: cellInfoToDateRange,
              cellArray: cellArray,
              cellIndex: cellIndex,
              rangeIndex: rangeIndex,
              className: className,
              isBeingEdited: isBeingEdited,
              onChange: onChange,
              grid: grid,
              cell: cell }));


        })));


    })));


});

var MINS_IN_DAY = 24 * 60;
var horizontalPrecision = 1;
var toDay = function toDay(x) {return x * horizontalPrecision;};
var toX = function toX(days) {return days / horizontalPrecision;};

var TimeGridScheduler = React__default.memo(function TimeGridScheduler(_ref)

















{var _ref$verticalPrecisio = _ref.verticalPrecision,verticalPrecision = _ref$verticalPrecisio === void 0 ? 30 : _ref$verticalPrecisio,_ref$visualGridVertic = _ref.visualGridVerticalPrecision,visualGridVerticalPrecision = _ref$visualGridVertic === void 0 ? 30 : _ref$visualGridVertic,style = _ref.style,schedule = _ref.schedule,_ref$originDate = _ref.originDate,originDate = _ref$originDate === void 0 ? new Date() : _ref$originDate,classes = _ref.classes,className = _ref.className,onChange = _ref.onChange;
  var numVerticalCells = MINS_IN_DAY / verticalPrecision;
  var numHorizontalCells = 7 / horizontalPrecision;
  var toMin = React.useCallback(function (y) {return y * verticalPrecision;}, [
  verticalPrecision]);

  var toY = function toY(mins) {return mins / verticalPrecision;};

  var cellInfoToDateRanges = React.useMemo(
  function () {return (
      createMapCellInfoToRecurringTimeRange({
        originDate: originDate,
        fromY: toMin,
        fromX: toDay }));},

  [toMin, toDay, originDate]);


  var cellInfoToSingleDateRange = React.useCallback(
  function (cell) {var _cellInfoToDateRanges =
    cellInfoToDateRanges(cell),_cellInfoToDateRanges2 = _toArray(_cellInfoToDateRanges),first = _cellInfoToDateRanges2[0],rest = _cellInfoToDateRanges2.slice(1);
    invariant(
    rest.length === 0, "Expected \"cellInfoToSingleDateRange\" to return a single date range, found ".concat(

    rest.length, " additional ranges instead. This is a bug in @remotelock/weekly-scheduler"));



    return first;
  },
  [cellInfoToDateRanges]);


  var dateRangeToCells = React.useMemo(
  function () {return (
      createMapDateRangeToCells({
        originDate: originDate,
        numVerticalCells: numVerticalCells,
        numHorizontalCells: numHorizontalCells,
        toX: toX,
        toY: toY }));},

  [toY, toX, numVerticalCells, numHorizontalCells, originDate]);


  var root = React.useRef(null);
  var parent = React.useRef(null);
  var timelineStickyStyle = useStickyStyle(root, { top: false, left: true });
  var headerStickyStyle = useStickyStyle(root, { top: false, left: false });

  var size = useComponentSize(parent);var _useClickAndDrag =






  useClickAndDrag(parent),dragBoxStyle = _useClickAndDrag.style,box = _useClickAndDrag.box,isDragging = _useClickAndDrag.isDragging,hasFinishedDragging = _useClickAndDrag.hasFinishedDragging,cancel = _useClickAndDrag.cancel;var _useState =



  React.useState(null),_useState2 = _slicedToArray(_useState, 2),pendingCreation = _useState2[0],setPendingCreation = _useState2[1];var _useMemo =

  React.useMemo(function () {
    if (parent.current !== null) {
      return [parent.current.scrollHeight, parent.current.scrollWidth];
    }

    return [null, null];
  }, [parent.current, size]),_useMemo2 = _slicedToArray(_useMemo, 2),totalHeight = _useMemo2[0],totalWidth = _useMemo2[1];

  var numVisualVerticalCells = 24 * 60 / visualGridVerticalPrecision;

  var grid = React.useMemo(function () {
    if (totalHeight === null || totalWidth === null) {
      return null;
    }

    return createGrid({
      totalHeight: totalHeight,
      totalWidth: totalWidth,
      numHorizontalCells: numHorizontalCells,
      numVerticalCells: numVerticalCells });

  }, [
  totalHeight,
  totalWidth,
  numHorizontalCells,
  numVerticalCells,
  numVisualVerticalCells]);


  React.useEffect(function () {
    if (grid === null || box === null) {
      setPendingCreation(null);
      return;
    }

    var constrainedBox = box;
    var cell = grid.getCellFromRect(constrainedBox);
    var dateRanges = cellInfoToDateRanges(cell);
    var event = dateRanges;
    setPendingCreation(event);
  }, [box, grid, setPendingCreation]);

  React.useEffect(function () {
    if (hasFinishedDragging) {
      onChange(mergeEvents(schedule, pendingCreation));
      setPendingCreation(null);
    }
  }, [
  hasFinishedDragging,
  onChange,
  setPendingCreation,
  pendingCreation,
  schedule]);


  var handleEventChange = React.useCallback(
  function (newDateRange, rangeIndex) {
    if (!schedule && newDateRange) {
      onChange([newDateRange]);

      return;
    }

    var newSchedule = _toConsumableArray(schedule);

    if (!newDateRange) {
      newSchedule.splice(rangeIndex, 1);
    } else {
      if (
      dateFns.isEqual(newDateRange[0], newSchedule[rangeIndex][0]) &&
      dateFns.isEqual(newDateRange[1], newSchedule[rangeIndex][1]))
      {
        return;
      }
      newSchedule[rangeIndex] = newDateRange;
    }

    newSchedule = mergeRanges(newSchedule);

    onChange(newSchedule);
  },
  [schedule]);


  useMousetrap(
  'esc',
  function () {
    if (pendingCreation) {
      cancel();
    }
  },
  document);var _useState3 =


  React.useState(

  [null, null]),_useState4 = _slicedToArray(_useState3, 2),_useState4$ = _slicedToArray(_useState4[0], 1),activeRangeIndex = _useState4$[0],setActive = _useState4[1];

  var handleDelete = React.useCallback(function () {
    if (activeRangeIndex === null) {
      return;
    }

    handleEventChange(undefined, activeRangeIndex);
  }, [activeRangeIndex, handleEventChange]);

  useMousetrap('del', handleDelete, root.current);

  React.useEffect(function () {
    cancel();
  }, [size]);

  var getDateRangeForVisualGrid = React.useMemo(
  function () {return (
      createMapCellInfoToContiguousDateRange({
        originDate: originDate,
        fromX: toDay,
        fromY: function fromY(y) {return y * visualGridVerticalPrecision;} }));},

  [visualGridVerticalPrecision, toDay, originDate]);


  React.useEffect(function () {
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

  }, [root.current, document.activeElement, schedule]);

  return (
    React__default.createElement("div", {
      ref: root,
      onBlur: function onBlur() {return setActive([null, null]);},
      style: style,
      className: classcat([
      className,
      classes.root, _defineProperty({},
      classes['no-scroll'], isDragging)]) },


    React__default.createElement("div", { style: timelineStickyStyle, "aria-hidden": true, className: classes.timeline },
    React__default.createElement("div", { className: classes.header },
    React__default.createElement("div", { className: classes['day-column'] },
    React__default.createElement("div", { className: classcat([classes.cell, classes.title]) }, "T"))),


    React__default.createElement("div", { className: classes.calendar },
    React__default.createElement("div", { className: classes['day-column'] },
    React__default.createElement("div", { className: classes['day-hours'] },
    lodash.times(numVisualVerticalCells).map(function (timeIndex) {
      return (
        React__default.createElement(Cell, {
          classes: classes,
          getDateRangeForVisualGrid: getDateRangeForVisualGrid,
          key: timeIndex,
          timeIndex: timeIndex },

        function (_ref3) {var start = _ref3.start,isHourStart = _ref3.isHourStart;
          if (isHourStart) {
            return (
              React__default.createElement("div", { className: classes.time },
              dateFns.format(start, 'h a')));


          }

          return null;
        }));


    }))))),





    React__default.createElement("div", null,
    React__default.createElement("div", {
      style: headerStickyStyle,
      role: "presentation",
      className: classcat([classes.calendar, classes.header]) },

    lodash.times(7).map(function (i) {return (
        React__default.createElement("div", { key: i, role: "presentation", className: classes['day-column'] },
        React__default.createElement("div", { className: classcat([classes.cell, classes.title]) },
        dateFns.format(dateFns.addDays(originDate, i), 'ddd'))));})),




    React__default.createElement("div", { className: classes['layer-container'] },
    isDragging &&
    React__default.createElement("div", { className: classes['drag-box'], style: dragBoxStyle },
    hasFinishedDragging && React__default.createElement("div", { className: classes.popup })),


    grid && pendingCreation && isDragging &&
    React__default.createElement(Schedule, {
      classes: classes,
      dateRangeToCells: dateRangeToCells,
      cellInfoToDateRange: cellInfoToSingleDateRange,
      className: classes['is-pending-creation'],
      ranges: mergeEvents(schedule, pendingCreation),
      grid: grid,
      moveAxis: "none" }),


    grid && !pendingCreation &&
    React__default.createElement(Schedule, {
      classes: classes,
      onActiveChange: setActive,
      dateRangeToCells: dateRangeToCells,
      cellInfoToDateRange: cellInfoToSingleDateRange,
      isResizable: true,
      moveAxis: "y",
      isDeletable: true,
      onChange: handleEventChange,
      ranges: schedule,
      grid: grid }),



    React__default.createElement("div", { ref: parent, role: "grid", className: classes.calendar },
    lodash.times(7).map(function (dayIndex) {
      return (
        React__default.createElement("div", {
          role: "gridcell",
          key: dayIndex,
          className: classes['day-column'] },

        React__default.createElement("div", { className: classes['day-hours'] },
        lodash.times(numVisualVerticalCells).map(function (timeIndex) {
          return (
            React__default.createElement(Cell, {
              classes: classes,
              getDateRangeForVisualGrid: getDateRangeForVisualGrid,
              key: timeIndex,
              timeIndex: timeIndex }));


        }))));



    }))))));





});

var classes = {"buttons-wrapper":"styles-module_buttons-wrapper__96_wO","no-scroll":"styles-module_no-scroll__3IUv5","root":"styles-module_root__2iNXQ","timeline":"styles-module_timeline__1hCLT","debug":"styles-module_debug__2eCNx","debug-active":"styles-module_debug-active__QqNIZ","calendar":"styles-module_calendar__tGgRK","react-draggable":"styles-module_react-draggable__3LVqd","handle-wrapper":"styles-module_handle-wrapper__26Eew","handle":"styles-module_handle__LTyBN","top":"styles-module_top__3D7og","bottom":"styles-module_bottom__daw_j","layer-container":"styles-module_layer-container__1wxVL","event":"styles-module_event__1PixZ","drag-box":"styles-module_drag-box__3w784","draggable":"styles-module_draggable__1Z1sE","button-reset":"styles-module_button-reset__1EwGq","is-draggable":"styles-module_is-draggable__176XM","react-draggable-dragging":"styles-module_react-draggable-dragging__2Kaj_","is-pending-creation":"styles-module_is-pending-creation__3Qr4x","hours-container":"styles-module_hours-container__2srEU","day-column":"styles-module_day-column__30McI","day-hours":"styles-module_day-hours__1E9lT","cell":"styles-module_cell__sVJZY","time":"styles-module_time__LJQW4","title":"styles-module_title__2VBFp","is-hour-start":"styles-module_is-hour-start__1_0Zo","header":"styles-module_header__10uIZ","first":"styles-module_first__IeNvS","popup":"styles-module_popup__2iu0Y","range-boxes":"styles-module_range-boxes__ib1Nb","event-content":"styles-module_event-content__3sakH","start":"styles-module_start__3CzHL","end":"styles-module_end__2L7Oy"};

exports.TimeGridScheduler = TimeGridScheduler;
exports.classes = classes;
