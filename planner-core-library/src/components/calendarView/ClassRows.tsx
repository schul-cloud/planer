import React, { Component } from 'react';
import styled from 'styled-components';
import { TopicElementsType, EventType } from '../types';
import TimeRasterWrapper from '../planner/TimeRasterWrapper';
import StylesProvider from '../provider/generalStylesProvider';
import { MONTHS_MAP } from '../constants';
import {
  getMonthAndYearString,
  getWeekDifference,
  getDayDifference
} from './timeHelper';
import RasterRow from './RasterRow';

type ClassTopicsDataType = {
  className: string;
  classes: {
    subjectId: string;
    subjectName: string;
    topics: TopicElementsType[];
  }[];
}[];

type PropsType = {
  className?: string;
  rasterSize: number;
  schoolYear: {
    startDate: number; // first day of school
    endDate: number; // last day of school
  };
  today: number;
  classTopicsData: ClassTopicsDataType;
  holidaysData: EventType;
  otherEventsData: EventType;
  onTopicInstanceClick: (id: string) => void;
};

const RasterRowContainer = styled.div`
  padding: ${({ isFirstSubject }: { isFirstSubject: boolean }) =>
    isFirstSubject ? '20px 0px 15px 0px' : '0px 0px 15px 0px'};
`;

const StyledFlexContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const StyledFlexChild = styled.div`
  display: inline-block;
  font-family: ${StylesProvider.generalStyles['font-family']};
  font-size: 14px;
  color: ${StylesProvider.generalStyles.defaultTextColor};
`;

const WEEK = 1000 * 60 * 60 * 24 * 7;

class ClassRows extends Component<PropsType> {
  getEventLabels = (events: EventType) => {
    const labelMap = {};
    const schoolYearStartDate = new Date(this.props.schoolYear.startDate);
    events.forEach(event => {
      const endIndex = getWeekDifference(
        schoolYearStartDate,
        new Date(event.endDate),
        false
      );
      labelMap[endIndex] = event.name;
    });
    return labelMap;
  };
  getMonthLabels = (startDate: number, endDate: number) => {
    const monthMap = {};
    let currentMonth = new Date(startDate).getMonth();

    for (let i = 0; startDate + i * WEEK <= endDate; i++) {
      const currentDate = new Date(startDate + i * WEEK);
      if (currentDate.getMonth() !== currentMonth) {
        currentMonth = currentDate.getMonth();
        monthMap[i] = MONTHS_MAP[currentMonth];
      }
    }

    return monthMap;
  };
  getColumnColorMap = (events: EventType) => {
    const columnColorMap = {};
    const schoolYearStartDate = new Date(this.props.schoolYear.startDate);
    events.forEach(event => {
      const startIndex = getWeekDifference(
        schoolYearStartDate,
        new Date(event.startDate),
        true
      );
      const endIndex = getWeekDifference(
        schoolYearStartDate,
        new Date(event.endDate),
        false
      );
      for (let i = startIndex; i <= endIndex; i++) {
        columnColorMap[i] = event.color;
      }
    });
    return columnColorMap;
  };

  transformToIndexTopics = (topics: TopicElementsType[]) => {
    return topics.map(topic => {
      const { startDate, endDate, ...otherProps } = topic;
      const schoolYearStartDate = new Date(this.props.schoolYear.startDate);
      const startIndex = getWeekDifference(
        schoolYearStartDate,
        new Date(topic.startDate),
        false
      );
      const endIndex = getWeekDifference(
        schoolYearStartDate,
        new Date(topic.endDate),
        false
      );

      return {
        ...otherProps,
        startIndex,
        endIndex
      };
    });
  };

  getClassRows = (
    classTopicsData: ClassTopicsDataType,
    rasterCount: number
  ) => {
    const result: JSX.Element[] = [];
    classTopicsData.forEach(classData => {
      classData.classes.forEach((subject, index) => {
        const isFirstSubject = index === 0;
        const transformedTopicElements = this.transformToIndexTopics(
          subject.topics
        );
        result.push(
          <RasterRowContainer
            isFirstSubject={isFirstSubject}
            key={`${classData.className}-${subject.subjectId}`}
          >
            <RasterRow
              topicElements={transformedTopicElements}
              rasterSize={this.props.rasterSize}
              rasterCount={rasterCount}
              onTopicInstanceClick={this.props.onTopicInstanceClick}
            />
          </RasterRowContainer>
        );
      });
    });

    return result;
  };

  render() {
    const {
      className,
      schoolYear: { startDate, endDate },
      rasterSize,
      today,
      classTopicsData,
      holidaysData,
      otherEventsData
    } = this.props;
    const startDateString = getMonthAndYearString(new Date(startDate));
    const endDateString = getMonthAndYearString(new Date(endDate));
    const rasterCount = getWeekDifference(
      new Date(startDate),
      new Date(endDate)
    );
    const rows = this.getClassRows(classTopicsData, rasterCount);
    const columnColorMap = this.getColumnColorMap([
      ...holidaysData,
      ...otherEventsData
    ]);
    const topLabelMap = this.getMonthLabels(startDate, endDate);
    const bottomLabelsMap = this.getEventLabels(otherEventsData);
    const todayLineIndex =
      today - startDate > 0
        ? Math.floor(getDayDifference(new Date(today), new Date(startDate)) / 7)
        : 0;

    return (
      <>
        <TimeRasterWrapper
          rasterCount={rasterCount}
          rasterSize={rasterSize}
          columnColorMap={columnColorMap}
          topLabelsMap={topLabelMap}
          bottomLabelsMap={bottomLabelsMap}
          className={className}
          todayLineIndex={todayLineIndex}
          topChildren={
            <StyledFlexContainer>
              <StyledFlexChild>{startDateString}</StyledFlexChild>
              <StyledFlexChild>{endDateString}</StyledFlexChild>
            </StyledFlexContainer>
          }
        >
          {rows}
        </TimeRasterWrapper>
      </>
    );
  }
}

export default ClassRows;
