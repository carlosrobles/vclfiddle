var expect = require('chai').expect;

describe('RequestMetadataService', function () {

  describe('#parseInputRequests()', function () {

    it('should parse a basic curl command', function (done) {
      RequestMetadataService.parseInputRequests('curl http://www.vclfiddle.net', function (err, input, allRequests) {
        if (err) return done(err);
        expect(allRequests.includedRequests.length).to.equal(1);
        expect(allRequests.includedRequests[0].entryIndex).to.equal(0);
        expect(allRequests.includedRequests[0].summary.method).to.equal('GET');
        expect(allRequests.includedRequests[0].summary.url).to.equal('http://www.vclfiddle.net');
        expect(allRequests.includedRequests[0].summary.httpVersion).to.equal('HTTP/1.1');
        expect(allRequests.includedRequests[0].payload).to.equal('GET / HTTP/1.1\r\nHost: www.vclfiddle.net\r\n\r\n');
        done();
      });
    });

    it('should parse a curl command with custom headers', function (done) {
      RequestMetadataService.parseInputRequests('curl --header "Accept: */*" http://www.vclfiddle.net -H \'DNT: 1\'', function (err, input, allRequests) {
        if (err) return done(err);
        expect(allRequests.includedRequests.length).to.equal(1);
        expect(allRequests.includedRequests[0].summary.url).to.equal('http://www.vclfiddle.net');
        expect(allRequests.includedRequests[0].payload).to.contain('Accept: */*\r\n');
        expect(allRequests.includedRequests[0].payload).to.contain('DNT: 1\r\n');
        done();
      });
    });

    it('should parse a curl command with Host header override', function (done) {
      RequestMetadataService.parseInputRequests('curl --header "Host: not.vclfiddle.net" http://www.vclfiddle.net', function (err, input, allRequests) {
        if (err) return done(err);
        expect(allRequests.includedRequests.length).to.equal(1);
        expect(allRequests.includedRequests[0].payload).to.contain('Host: not.vclfiddle.net\r\n');
        expect(allRequests.includedRequests[0].payload).to.not.contain('Host: www.vclfiddle.net\r\n');
        done();
      });
    });

    it('should ignore custom Connection: headers with a warning', function (done) {
      RequestMetadataService.parseInputRequests('curl --header "Connection: Upgrade" http://www.vclfiddle.net', function (err, input, allRequests) {
        if (err) return done(err);
        expect(allRequests.includedRequests.length).to.equal(1);
        expect(allRequests.includedRequests[0].payload).to.not.contain('Connection:');
        expect(allRequests.includedRequests[0].warnings).to.contain('Connection request header not supported.');
        done();
      });
    });

    it('should categorise requests for hosts other than the first as excluded', function (done) {
      RequestMetadataService.parseInputRequests('curl --header "Host: first" http://www.vclfiddle.net\ncurl --header "Host: second" http://www.vclfiddle.net', function (err, input, allRequests) {
        if (err) return done(err);
        expect(allRequests.includedRequests.length).to.equal(1);
        expect(allRequests.excludedRequests.length).to.equal(1);
        expect(allRequests.excludedRequests[0].excludeReason).to.equal('Ignored');
        expect(allRequests.excludedRequests[0].message).to.contain('Host does not match first request');
        done();
      });
    });

    it('should exclude command with missing url');
    it('should exclude command with invalid url');
    it('should ignore the --compressed arg or ensure that Accept-Encoding header is present');
    it('should ignore understand the POST method and request body');
    it('should show warnings for unsupported or excess curl arguments');
    it('should understand the -0 argument for HTTP/1.0');
    it('should understand HTTPS');
    it('should understand --user-agent and --referrer arguments and their shorthand');

  });

});