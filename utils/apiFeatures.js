class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  filtering() {
    const queryObj = { ...this.queryStr };
    const excludedObj = ['page', 'sort', 'limit', 'fields'];
    excludedObj.map((el) => delete queryObj[el]);

    ///1B) advanced filtering
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    this.query.find(JSON.parse(queryString));
    return this;
  }
  sorting() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join('');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limitingField() {
    if (this.queryStr.fields) {
      const field = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(field);
    } else {
      // this.query = this.query.select('-__v');
    }
    return this;
  }
  pagination() {
    // const page = this.queryStr.page * 1 || 1;
    // const limit = this.queryStr.limit * 1 || 3;
    const page = this.queryStr.page * 1;
    const limit = this.queryStr.limit * 1;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
