import axios from 'axios';
import moment from 'moment-timezone';
import tz_lookup from 'tz-lookup';
import * as Sentry from "@sentry/react";

const applyExtraBusinessInfo = (business) => {
  business.position = {lat: business.coordinates.latitude, lng: business.coordinates.longitude}; //easier position parsing 
  business.hours = business.hours[0]; //easier hours parsing
  if (business.hours) parseHours(business);

  return business;
}

const getAllUniqueCategories = (businesses) => {
  const allCategories = businesses.map(x => x.categories).flat().map(y => {return {alias: y.alias, title: y.title}});
  const uniqueCategories = allCategories.filter((value, index) => allCategories.findIndex(obj => obj.alias === value.alias) === index);
  const uniqueCategoriesSorted = uniqueCategories.sort((a, b) => (a.title > b.title) ? 1 : - 1);

  console.log({uniqueCategoriesSorted});
  return uniqueCategoriesSorted;
}

const parseHours = (business) => {
  const daysOfTheWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const nextDayToCheck = (dayOfWeek) => {
    return dayOfWeek < 6 ? dayOfWeek + 1 : 0;
  }

  const convertMomentDayToYelpDay = (day) => {
    return day === 0 ? 6 : day - 1;
    // 0 6
    // 1 0
    // 2 1
    // 3 2
    // 4 3
    // 5 4
    // 6 5
  }

  const timeZoneBusiness = tz_lookup(business.position.lat, business.position.lng);

  const now = moment().tz(timeZoneBusiness);
  const nowYelpDay = convertMomentDayToYelpDay(now.day());
  const nowTimeFormatted = `${now.format('HHmm')}`
  let openingMessage = '';

  const openingHours = business.hours.open;  
  const findOpeningBlock = (dayOfWeek) => {
    const openHoursThisDay = openingHours.filter(x => x.day === dayOfWeek);
    if (openHoursThisDay.length > 0) {
      if (openHoursThisDay.filter(open => open.day === nowYelpDay && open.start < nowTimeFormatted && open.end > nowTimeFormatted).length > 0) { // open right now
        
        // console.log(`${business.name} is open right now`);
        const currentOpeningBlock = openHoursThisDay
          .filter(open => open.day === nowYelpDay && open.start < nowTimeFormatted && open.end > nowTimeFormatted)[0];

        openingMessage = `Open until ${moment(currentOpeningBlock.end, 'HHmm').format('h:mm A')}`;
        business.hours.is_open_now = true;
        business.hours.open_info = {
          time: moment(currentOpeningBlock.end, 'HHmm').format('h:mm A'),
        }
  
        // openHoursThisDay.map(open => console.log({start: open.start, end: open.end}));
      } else if (openHoursThisDay.filter(open => open.day === nowYelpDay && open.start > nowTimeFormatted).length > 0) { // open later today
        
        // console.log(`${business.name} is open later today`);
        
        const currentOpeningBlock = openHoursThisDay
          .filter(open => open.day === nowYelpDay && open.start > nowTimeFormatted)
          .sort((a, b) => a.start - b.start)[0];

        openingMessage = `Opens at ${moment(currentOpeningBlock.start, 'HHmm').format('h:mm A')}`;
        business.hours.is_open_now = false;
        business.hours.open_info = {
          time: moment(currentOpeningBlock.start, 'HHmm').format('h:mm A'),
        }
  
        // openHoursThisDay.map(open => console.log({start: open.start, end: open.end}));
      } else if (openHoursThisDay.filter(open => open.day === nowYelpDay && open.end < nowTimeFormatted).length > 0 && !(openingHours.length === 1)) { // was open today, now closed
        
        // console.log(`${business.name} was open today but is now closed, will look on ${daysOfTheWeek[nextDayToCheck(dayOfWeek)]}`);

        // openHoursThisDay.map(open => console.log({start: open.start, end: open.end}));
        findOpeningBlock(nextDayToCheck(dayOfWeek));
      } else if (openHoursThisDay.filter(open => open.day === dayOfWeek) || openingHours.length === 1) { // open on another day
        
        // console.log(`${business.name} is not open today, but next open on ${daysOfTheWeek[dayOfWeek]}`);

        const currentOpeningBlock = openHoursThisDay
          .filter(open => open.day === dayOfWeek)
          .sort((a, b) => a.start - b.start)[0];
        
        const tomorrow = dayOfWeek === nextDayToCheck(nowYelpDay);
        openingMessage = `Opens ${tomorrow ? 'tomorrow' : daysOfTheWeek[dayOfWeek]} at ${moment(currentOpeningBlock.start, 'HHmm').format('h:mm A')}`;
        business.hours.is_open_now = false;
        business.hours.open_info = {
          day: tomorrow ? 'tomorrow' : daysOfTheWeek[dayOfWeek],
          time: moment(currentOpeningBlock.start, 'HHmm').format('h:mm A'),
        }

        // openHoursThisDay.map(open => console.log({start: open.start, end: open.end}));
      } else { // not open on this day, look for next day
        // console.log(`${business.name} is not open on ${daysOfTheWeek[dayOfWeek]}, will continue looking`);
        findOpeningBlock(nextDayToCheck(dayOfWeek));
      }
    } else { // not open on this day, look for next day
      // console.log(`${business.name} is not open on ${daysOfTheWeek[dayOfWeek]}, will continue looking`);
      findOpeningBlock(nextDayToCheck(dayOfWeek));
    }
  }
  
  findOpeningBlock(convertMomentDayToYelpDay(now.day())); // moment day 0 is Sunday, Yelp day 0 is Monday
  // console.log({openingMessage});
  return openingMessage;
}

const saveBusinessInfo = async (business, businesses) => {
  console.log({business});
  console.log(`in saveBusinessInfo for ${business.alias}`);
  const yelpBusinessUri = `/api/yelp-business`;
  const params = {
    action: 'updateSaved',
  }
  try {
    const updatedResponse = await axios.put(yelpBusinessUri, business, {params});
    const updatedBusinessData = applyExtraBusinessInfo(updatedResponse.data);
    const updatedBusinesses = businesses.map(biz => biz.alias === business.alias ? updatedBusinessData : biz);
    console.log(`updatedBusiness:`);
    console.log(businesses.filter(biz => biz.alias === business.alias)[0]);
    return updatedBusinesses;
    // setSelected(updatedBusinessData);
  } catch (error) {
    console.log({error});
    Sentry.captureException(error);
  }
}

const YelpBusinessService = {
  saveBusinessInfo,
  applyExtraBusinessInfo,
  parseHours,
  getAllUniqueCategories,
}

export default YelpBusinessService;