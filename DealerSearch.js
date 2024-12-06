import React, { useState, useEffect, useRef } from 'react';
import { Button, Spinner, Card, Row, Col } from 'react-bootstrap';
import { FaSearch, FaIdBadge, FaUser, FaUserTie, FaBuilding, FaMapMarkerAlt, FaMobileAlt, FaEnvelope, FaInfoCircle } from 'react-icons/fa';

const DealerSearch = () => {
  const API_URL = "https://portal.staging.autofintech.co.uk/api/dealer-company/search";
  const API_KEY = "795T8798798WvC8S5LXXX852NLfF9cUu387878";
  const ITEMS_PER_PAGE = 2;

  const [searchInput, setSearchInput] = useState("");
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchCache, setSearchCache] = useState({});
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [isPagination, setIsPagination] = useState(false);
  
 
  const searchInputRef = useRef(searchInput);

  useEffect(() => {
    searchInputRef.current = searchInput;
  }, [searchInput]);

  const searchDealer = async (page) => {
    setLoading(true);
    setNoResultsFound(false);

    if (!searchInput.trim()) {
      setDealers([]);
      setLoading(false);
      return;
    }

    
    if (searchCache[searchInput] && searchCache[searchInput][page]) {
      setDealers(searchCache[searchInput][page].items);
      setTotalPages(searchCache[searchInput][page].pagination.total_pages);
      setCurrentPage(page);
      setLoading(false);
      return;
    }

    
    try {
      const response = await fetch(`${API_URL}?page=${page}&per_page=${ITEMS_PER_PAGE}&query=${encodeURIComponent(searchInput)}`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "dca-api-key": API_KEY,
        }
      });

      if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);

      const data = await response.json();

      if (data.items && data.items.length > 0) {
        setDealers(data.items);
        setTotalPages(data.pagination.total_pages);
        setSearchCache(prevCache => ({
          ...prevCache,
          [searchInput]: {
            ...prevCache[searchInput],
            [page]: data,
          }
        }));
      } else {
        setDealers([]);
        setNoResultsFound(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setIsPagination(false);
    }
  };

  const handleSearch = () => {
    setIsSearch(true);
    setIsPagination(false);
    setCurrentPage(1);
    searchDealer(1);
  };

  const handlePagination = (page) => {
    setIsPagination(true);
    setCurrentPage(page);
    searchDealer(page);
  };

  const updatePaginationControls = () => (
    <div className="pagination d-flex justify-content-center mt-4">
      <Button
        variant="primary"
        className="mx-1"
        onClick={() => handlePagination(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <span className="mx-2">Page {currentPage} of {totalPages}</span>
      <Button
        variant="primary"
        className="mx-1"
        onClick={() => handlePagination(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );

  const updateSearchInput = (e) => setSearchInput(e.target.value);

  return (
    <div className="container my-4">
      <h1 className="text-center mb-4 typing-animation">Dealer Search</h1>

      <div className="d-flex justify-content-center mb-3">
        <div className="input-group w-50">
          <input
            type="text"
            id="searchInput"
            className="form-control"
            placeholder="Search dealers..."
            value={searchInput}
            onChange={updateSearchInput}
          />
          <Button variant="primary" onClick={handleSearch}>
            Search <FaSearch className="ms-2" />
          </Button>
        </div>
      </div>

      {loading && isSearch && !noResultsFound && !isPagination && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" />
        </div>
      )}

      <Row id="results">
        {dealers.length > 0 ? (
          dealers.map(dealer => (
            <Col key={dealer.id} md={6} className="mb-4">
              <Card className="shadow-sm">
                
                <Card.Body>
                  <h5 className="card-title"><strong><FaIdBadge className="me-2" />ID:</strong>{dealer.id || "No id Provided"}</h5>
                  <Row className="mb-3">
                    <Col md={6}><strong><FaIdBadge className="me-2" />Username:</strong></Col>
                    <Col md={6}>{dealer.username || "No username Provided"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={6}><strong><FaUser className="me-2" />Forename:</strong></Col>
                    <Col md={6}>{dealer.forename || "No Forename Provided"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={6}><strong><FaUserTie className="me-2" />Surname:</strong></Col>
                    <Col md={6}>{dealer.surname || "No Surname Provided"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={6}><strong><FaBuilding className="me-2" />Account:</strong></Col>
                    <Col md={6}>{dealer.account || "No Account Provided"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={6}><strong><FaMapMarkerAlt className="me-2" />Address:</strong></Col>
                    <Col md={6}>{dealer.address || "No Address Provided"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={6}><strong><FaMobileAlt className="me-2" />Mobile:</strong></Col>
                    <Col md={6}>{dealer.mobile || dealer.email || "No Mobile Provided"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={6}><strong><FaEnvelope className="me-2" />Email:</strong></Col>
                    <Col md={6}>{dealer.email || "No Email Provided"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={6}><strong><FaInfoCircle className="me-2" />Description:</strong></Col>
                    <Col md={6}>{dealer.description || "No Description Available"}</Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          isSearch && noResultsFound && (
            <div className="col-12 text-center">
              <h1 className="no-results fade-in">No Results Found</h1>
            </div>
          )
        )}
      </Row>

      {dealers.length > 0 && updatePaginationControls()}
    </div>
  );
};

export default DealerSearch;
