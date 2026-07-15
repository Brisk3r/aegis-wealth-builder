import unittest
import asyncio
from config import config
from agent_orchestrator import AegisOrchestrator
from agents.researcher import NicheResearcher
from agents.writer import ContentWriter
from agents.developer import ToolDeveloper
from agents.promoter import ContentPromoter

class TestAegisAgents(unittest.TestCase):
    
    def test_config_initialization(self):
        """Verifies that the configuration object loads correctly."""
        self.assertIsNotNone(config)
        self.assertTrue(hasattr(config, 'model_backend'))
        self.assertTrue(hasattr(config, 'remaining_budget'))
        
    def test_agent_instantiation(self):
        """Verifies that all specialized agents can be instantiated without errors."""
        researcher = NicheResearcher()
        writer = ContentWriter()
        developer = ToolDeveloper()
        promoter = ContentPromoter()
        
        self.assertIsNotNone(researcher)
        self.assertIsNotNone(writer)
        self.assertIsNotNone(developer)
        self.assertIsNotNone(promoter)
        
    def test_orchestrator_initialization(self):
        """Verifies that the main orchestrator can be instantiated."""
        orchestrator = AegisOrchestrator()
        self.assertIsNotNone(orchestrator)
        self.assertTrue(hasattr(orchestrator, 'run_iteration'))

if __name__ == "__main__":
    unittest.main()
